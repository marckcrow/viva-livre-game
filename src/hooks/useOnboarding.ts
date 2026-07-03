import { useEffect, useState } from "react";

const KEY = "vivaLivre_onboarding";

export type MainGoal =
  | "stop_addiction"
  | "reduce_habit"
  | "improve_discipline"
  | "manage_emotions"
  | "spiritual_growth"
  | "organize_life"
  | "other";

export type ChallengeType =
  | "alcohol"
  | "tobacco"
  | "drugs"
  | "pornography"
  | "gambling"
  | "shopping"
  | "food"
  | "social_media"
  | "codependency"
  | "anger"
  | "anxiety"
  | "procrastination"
  | "no_purpose"
  | "other";

export type Tone = "gentle" | "direct" | "philosophical" | "spiritual";

export interface OnboardingData {
  completed: boolean;
  goal?: MainGoal;
  challenge?: ChallengeType;
  tone?: Tone;
  trackSavings?: boolean;
  startDate?: string; // ISO
  completedAt?: string;
}

export function useOnboarding() {
  const [data, setData] = useState<OnboardingData>({ completed: false });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try {
        setData(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
    setLoaded(true);
  }, []);

  const save = (updates: Partial<OnboardingData>) => {
    const next = { ...data, ...updates };
    localStorage.setItem(KEY, JSON.stringify(next));
    setData(next);
  };

  const complete = (final: Omit<OnboardingData, "completed" | "completedAt">) => {
    const next: OnboardingData = {
      ...final,
      completed: true,
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(next));
    setData(next);
  };

  const reset = () => {
    localStorage.removeItem(KEY);
    setData({ completed: false });
  };

  return { data, loaded, save, complete, reset };
}
