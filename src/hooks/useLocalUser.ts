import { useState, useEffect } from "react";

const LOCAL_USER_KEY = "vivaLivre_userId";
const LOCAL_PROGRESS_KEY = "vivaLivre_progress";
const LOCAL_CONSUMPTION_KEY = "vivaLivre_consumption";
const LOCAL_ACHIEVEMENTS_KEY = "vivaLivre_achievements";
const LOCAL_PLAN_KEY = "vivaLivre_plan";

export interface LocalProgress {
  startDate: string;
  daysClean: number;
  lastCheckIn: string;
}

export interface LocalConsumption {
  id: string;
  consumptionType: "alcohol" | "tobacco";
  drinkType?: "wine" | "beer" | "spirits" | "bottle" | "halfBottle";
  quantity?: number;
  cigaretteCount?: number;
  cost?: number;
  consumptionDate: string;
  notes?: string;
  createdAt: string;
}

export interface LocalPlan {
  currentPhase: number;
  phaseStartDate: string;
  planStartDate: string;
  initialCigarettesPerDay: number;
  currentCigarettesPerDay: number;
}

function generateUserId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function useLocalUser() {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    let stored = localStorage.getItem(LOCAL_USER_KEY);
    if (!stored) {
      stored = generateUserId();
      localStorage.setItem(LOCAL_USER_KEY, stored);
    }
    setUserId(stored);
  }, []);

  return { userId };
}

export function useLocalProgress() {
  const [progress, setProgress] = useState<LocalProgress | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    const stored = localStorage.getItem(LOCAL_PROGRESS_KEY);
    if (stored) {
      const data = JSON.parse(stored) as LocalProgress;
      // Calculate days clean automatically
      const startDate = new Date(data.startDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      const daysClean = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      setProgress({ ...data, daysClean });
    } else {
      // Create initial progress
      const initial: LocalProgress = {
        startDate: new Date().toISOString(),
        daysClean: 0,
        lastCheckIn: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(initial));
      setProgress(initial);
    }
  };

  const resetProgress = () => {
    const reset: LocalProgress = {
      startDate: new Date().toISOString(),
      daysClean: 0,
      lastCheckIn: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(reset));
    setProgress(reset);
  };

  return { progress, resetProgress, loadProgress };
}

export function useLocalConsumption() {
  const [records, setRecords] = useState<LocalConsumption[]>([]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const stored = localStorage.getItem(LOCAL_CONSUMPTION_KEY);
    if (stored) {
      setRecords(JSON.parse(stored));
    }
  };

  const addRecord = (record: Omit<LocalConsumption, "id" | "createdAt">) => {
    const newRecord: LocalConsumption = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRecord, ...records];
    localStorage.setItem(LOCAL_CONSUMPTION_KEY, JSON.stringify(updated));
    setRecords(updated);
    return newRecord;
  };

  const getLastConsumptionDate = (): Date | null => {
    if (records.length === 0) return null;
    const sorted = [...records].sort(
      (a, b) => new Date(b.consumptionDate).getTime() - new Date(a.consumptionDate).getTime()
    );
    return new Date(sorted[0].consumptionDate);
  };

  return { records, addRecord, loadRecords, getLastConsumptionDate };
}

export function useLocalAchievements() {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_ACHIEVEMENTS_KEY);
    if (stored) {
      setUnlockedIds(new Set(JSON.parse(stored)));
    }
  }, []);

  const unlockAchievement = (achievementId: string) => {
    const updated = new Set([...unlockedIds, achievementId]);
    localStorage.setItem(LOCAL_ACHIEVEMENTS_KEY, JSON.stringify([...updated]));
    setUnlockedIds(updated);
  };

  const isUnlocked = (achievementId: string) => unlockedIds.has(achievementId);

  return { unlockedIds, unlockAchievement, isUnlocked };
}

export function useLocalPlan() {
  const [plan, setPlan] = useState<LocalPlan | null>(null);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = () => {
    const stored = localStorage.getItem(LOCAL_PLAN_KEY);
    if (stored) {
      setPlan(JSON.parse(stored));
    } else {
      const initial: LocalPlan = {
        currentPhase: 1,
        phaseStartDate: new Date().toISOString(),
        planStartDate: new Date().toISOString(),
        initialCigarettesPerDay: 0,
        currentCigarettesPerDay: 0,
      };
      localStorage.setItem(LOCAL_PLAN_KEY, JSON.stringify(initial));
      setPlan(initial);
    }
  };

  const updatePlan = (updates: Partial<LocalPlan>) => {
    if (!plan) return;
    const updated = { ...plan, ...updates };
    localStorage.setItem(LOCAL_PLAN_KEY, JSON.stringify(updated));
    setPlan(updated);
  };

  const advancePhase = () => {
    if (!plan || plan.currentPhase >= 3) return;
    updatePlan({
      currentPhase: plan.currentPhase + 1,
      phaseStartDate: new Date().toISOString(),
    });
  };

  return { plan, updatePlan, advancePhase, loadPlan };
}

// Calculate days clean based on last consumption
export function calculateDaysClean(records: LocalConsumption[]): number {
  if (records.length === 0) {
    // If no consumption records, count from account creation (progress start)
    const progressStored = localStorage.getItem(LOCAL_PROGRESS_KEY);
    if (progressStored) {
      const progress = JSON.parse(progressStored) as LocalProgress;
      const startDate = new Date(progress.startDate);
      const now = new Date();
      return Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  // Find the most recent consumption date
  const sorted = [...records].sort(
    (a, b) => new Date(b.consumptionDate).getTime() - new Date(a.consumptionDate).getTime()
  );
  const lastConsumption = new Date(sorted[0].consumptionDate);
  const now = new Date();
  
  // Calculate days since last consumption
  const diffTime = now.getTime() - lastConsumption.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
