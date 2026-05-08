import { useState, useEffect, useCallback } from "react";

const HABITS_KEY = "vivaLivre_habits";
const CHECKINS_KEY = "vivaLivre_habitCheckins";
const HABIT_ACHIEVEMENTS_KEY = "vivaLivre_habitAchievements";

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  weeklyGoal: number; // dias por semana (1-7)
  createdAt: string;
}

export interface HabitCheckin {
  habitId: string;
  date: string; // YYYY-MM-DD
}

export interface HabitAchievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt: string;
}

const DEFAULT_HABITS: Omit<Habit, "id" | "createdAt">[] = [
  { name: "Beber 2L de água", emoji: "💧", weeklyGoal: 7 },
  { name: "Caminhar 30 min", emoji: "🚶", weeklyGoal: 5 },
  { name: "Meditar / respirar", emoji: "🧘", weeklyGoal: 5 },
  { name: "Dormir 7h+", emoji: "😴", weeklyGoal: 6 },
];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // domingo
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkins, setCheckins] = useState<HabitCheckin[]>([]);
  const [achievements, setAchievements] = useState<HabitAchievement[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(HABITS_KEY);
    if (stored) {
      setHabits(JSON.parse(stored));
    } else {
      const seeded: Habit[] = DEFAULT_HABITS.map((h) => ({
        ...h,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
      }));
      localStorage.setItem(HABITS_KEY, JSON.stringify(seeded));
      setHabits(seeded);
    }
    const c = localStorage.getItem(CHECKINS_KEY);
    if (c) setCheckins(JSON.parse(c));
    const a = localStorage.getItem(HABIT_ACHIEVEMENTS_KEY);
    if (a) setAchievements(JSON.parse(a));
  }, []);

  const persistHabits = (next: Habit[]) => {
    localStorage.setItem(HABITS_KEY, JSON.stringify(next));
    setHabits(next);
  };

  const persistCheckins = (next: HabitCheckin[]) => {
    localStorage.setItem(CHECKINS_KEY, JSON.stringify(next));
    setCheckins(next);
  };

  const persistAchievements = (next: HabitAchievement[]) => {
    localStorage.setItem(HABIT_ACHIEVEMENTS_KEY, JSON.stringify(next));
    setAchievements(next);
  };

  const addHabit = (name: string, emoji: string, weeklyGoal: number) => {
    const newHabit: Habit = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      emoji,
      weeklyGoal: Math.max(1, Math.min(7, weeklyGoal)),
      createdAt: new Date().toISOString(),
    };
    persistHabits([...habits, newHabit]);
  };

  const removeHabit = (id: string) => {
    persistHabits(habits.filter((h) => h.id !== id));
    persistCheckins(checkins.filter((c) => c.habitId !== id));
  };

  const isCheckedToday = (habitId: string) => {
    const t = todayStr();
    return checkins.some((c) => c.habitId === habitId && c.date === t);
  };

  const toggleCheckin = (habitId: string) => {
    const t = todayStr();
    const exists = checkins.some((c) => c.habitId === habitId && c.date === t);
    const next = exists
      ? checkins.filter((c) => !(c.habitId === habitId && c.date === t))
      : [...checkins, { habitId, date: t }];
    persistCheckins(next);
  };

  const getStreak = (habitId: string): number => {
    let streak = 0;
    const d = new Date();
    while (true) {
      const s = d.toISOString().split("T")[0];
      if (checkins.some((c) => c.habitId === habitId && c.date === s)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        // se for hoje e ainda não marcou, não quebra a sequência (segue de ontem)
        if (streak === 0 && s === todayStr()) {
          d.setDate(d.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return streak;
  };

  const getWeekProgress = (habitId: string): number => {
    const weekStart = getWeekStart(new Date());
    return checkins.filter(
      (c) => c.habitId === habitId && c.date >= weekStart
    ).length;
  };

  // Conquistas automáticas
  useEffect(() => {
    if (habits.length === 0) return;
    const unlocked = new Set(achievements.map((a) => a.id));
    const newOnes: HabitAchievement[] = [];

    const totalCheckins = checkins.length;
    const milestones = [
      { id: "first-checkin", count: 1, name: "Primeiro passo", emoji: "🌱", description: "Seu primeiro check-in de hábito" },
      { id: "ten-checkins", count: 10, name: "Construindo rotina", emoji: "🧱", description: "10 check-ins concluídos" },
      { id: "fifty-checkins", count: 50, name: "Disciplinado", emoji: "💪", description: "50 check-ins concluídos" },
      { id: "hundred-checkins", count: 100, name: "Mestre dos hábitos", emoji: "🏆", description: "100 check-ins concluídos" },
    ];

    milestones.forEach((m) => {
      if (totalCheckins >= m.count && !unlocked.has(m.id)) {
        newOnes.push({ ...m, unlockedAt: new Date().toISOString() });
      }
    });

    // Streak achievements
    habits.forEach((h) => {
      const streak = getStreak(h.id);
      const streakMilestones = [
        { days: 3, id: `streak-3-${h.id}`, name: "3 dias seguidos", emoji: "🔥" },
        { days: 7, id: `streak-7-${h.id}`, name: "Semana perfeita", emoji: "⚡" },
        { days: 21, id: `streak-21-${h.id}`, name: "Hábito formado (21 dias)", emoji: "✨" },
      ];
      streakMilestones.forEach((s) => {
        if (streak >= s.days && !unlocked.has(s.id)) {
          newOnes.push({
            id: s.id,
            name: s.name,
            description: `${h.emoji} ${h.name}`,
            emoji: s.emoji,
            unlockedAt: new Date().toISOString(),
          });
        }
      });
      // Meta semanal cumprida
      const weekProg = getWeekProgress(h.id);
      const weekId = `week-goal-${h.id}-${getWeekStart(new Date())}`;
      if (weekProg >= h.weeklyGoal && !unlocked.has(weekId)) {
        newOnes.push({
          id: weekId,
          name: "Meta semanal atingida",
          description: `${h.emoji} ${h.name}`,
          emoji: "🎯",
          unlockedAt: new Date().toISOString(),
        });
      }
    });

    if (newOnes.length > 0) {
      persistAchievements([...achievements, ...newOnes]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkins, habits]);

  return {
    habits,
    checkins,
    achievements,
    addHabit,
    removeHabit,
    toggleCheckin,
    isCheckedToday,
    getStreak,
    getWeekProgress,
  };
}
