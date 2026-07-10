import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const K = {
  checkin: "jornada_checkin",
  control: "jornada_control",
  priorities: "jornada_priorities",
  virtue: "jornada_virtue",
  mission: "jornada_mission",
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export type Mood =
  | "tranquilo"
  | "motivado"
  | "cansado"
  | "preocupado"
  | "irritado"
  | "desanimado"
  | "esperancoso"
  | "sobrecarregado";

export type ControlLevel = "sim" | "parcialmente" | "nao" | "ainda_nao_sei";
export type ControlType = "controllable" | "partial" | "uncontrollable";
export type PriorityLevel = "essential" | "important" | "desirable";

export interface Checkin {
  mood: Mood | null;
  intensity: number; // 1-5
  controlLevel: ControlLevel | null;
  notes?: string;
}

export interface ControlItem {
  id: string;
  description: string;
  type: ControlType;
}

export interface Priorities {
  essential: { text: string; done: boolean };
  important: { text: string; done: boolean };
  desirable: { text: string; done: boolean };
}

export interface VirtueSelection {
  virtueName: string | null;
  intendedAction: string;
  reflection?: string;
  rating?: number;
}

export interface MissionState {
  missionId: string | null;
  accepted: boolean;
  completed: boolean;
  learning?: string;
}

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${key}_${todayStr()}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLS<T>(key: string, value: T) {
  localStorage.setItem(`${key}_${todayStr()}`, JSON.stringify(value));
}

export function useStoicDay() {
  const { user } = useAuth();

  const [checkin, setCheckinState] = useState<Checkin>(() =>
    readLS(K.checkin, { mood: null, intensity: 3, controlLevel: null, notes: "" })
  );
  const [controlItems, setControlItems] = useState<ControlItem[]>(() =>
    readLS(K.control, [])
  );
  const [priorities, setPrioritiesState] = useState<Priorities>(() =>
    readLS(K.priorities, {
      essential: { text: "", done: false },
      important: { text: "", done: false },
      desirable: { text: "", done: false },
    })
  );
  const [virtue, setVirtueState] = useState<VirtueSelection>(() =>
    readLS(K.virtue, { virtueName: null, intendedAction: "" })
  );
  const [mission, setMissionState] = useState<MissionState>(() =>
    readLS(K.mission, { missionId: null, accepted: false, completed: false })
  );

  // Persistência local + sync opcional (best-effort)
  const setCheckin = useCallback(
    (next: Checkin) => {
      setCheckinState(next);
      writeLS(K.checkin, next);
      if (user && next.mood && next.controlLevel) {
        supabase
          .from("stoic_daily_checkins")
          .upsert(
            {
              user_id: user.id,
              entry_date: todayStr(),
              mood: next.mood,
              mood_intensity: next.intensity,
              control_level: next.controlLevel,
              notes: next.notes ?? null,
            },
            { onConflict: "user_id,entry_date" }
          )
          .then(() => {});
      }
    },
    [user]
  );

  const addControlItem = useCallback(
    (description: string, type: ControlType) => {
      const item: ControlItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        description,
        type,
      };
      const next = [...controlItems, item];
      setControlItems(next);
      writeLS(K.control, next);
      if (user) {
        supabase
          .from("stoic_control_items")
          .insert({
            user_id: user.id,
            entry_date: todayStr(),
            description,
            control_type: type,
          })
          .then(() => {});
      }
    },
    [controlItems, user]
  );

  const moveControlItem = useCallback(
    (id: string, type: ControlType) => {
      const next = controlItems.map((c) => (c.id === id ? { ...c, type } : c));
      setControlItems(next);
      writeLS(K.control, next);
    },
    [controlItems]
  );

  const removeControlItem = useCallback(
    (id: string) => {
      const next = controlItems.filter((c) => c.id !== id);
      setControlItems(next);
      writeLS(K.control, next);
    },
    [controlItems]
  );

  const setPriorities = useCallback(
    (next: Priorities) => {
      setPrioritiesState(next);
      writeLS(K.priorities, next);
      if (user) {
        const rows = (["essential", "important", "desirable"] as PriorityLevel[])
          .filter((lvl) => next[lvl].text.trim().length > 0)
          .map((lvl) => ({
            user_id: user.id,
            entry_date: todayStr(),
            priority_level: lvl,
            description: next[lvl].text,
            completed: next[lvl].done,
          }));
        if (rows.length > 0) {
          supabase.from("stoic_priorities").insert(rows).then(() => {});
        }
      }
    },
    [user]
  );

  const setVirtue = useCallback((next: VirtueSelection) => {
    setVirtueState(next);
    writeLS(K.virtue, next);
  }, []);

  const setMission = useCallback((next: MissionState) => {
    setMissionState(next);
    writeLS(K.mission, next);
  }, []);

  // Reset diário automático quando a data muda
  useEffect(() => {
    const timer = setInterval(() => {
      const today = todayStr();
      const raw = localStorage.getItem(`${K.checkin}_${today}`);
      if (!raw && checkin.mood) {
        setCheckinState({ mood: null, intensity: 3, controlLevel: null, notes: "" });
        setControlItems([]);
        setPrioritiesState({
          essential: { text: "", done: false },
          important: { text: "", done: false },
          desirable: { text: "", done: false },
        });
        setVirtueState({ virtueName: null, intendedAction: "" });
        setMissionState({ missionId: null, accepted: false, completed: false });
      }
    }, 60_000);
    return () => clearInterval(timer);
  }, [checkin.mood]);

  return {
    checkin,
    setCheckin,
    controlItems,
    addControlItem,
    moveControlItem,
    removeControlItem,
    priorities,
    setPriorities,
    virtue,
    setVirtue,
    mission,
    setMission,
  };
}
