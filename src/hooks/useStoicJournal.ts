import { useEffect, useState } from "react";

const KEY = "vivaLivre_stoicJournal";

export type JournalMood = "sereno" | "grato" | "firme" | "tenso" | "triste" | "irritado";

export interface StoicJournalEntry {
  id: string;
  createdAt: string; // ISO
  period: "morning" | "evening";
  mood?: JournalMood;
  // Morning
  control?: string;
  virtue?: string;
  temptation?: string;
  response?: string;
  // Evening
  wins?: string;
  failures?: string;
  learned?: string;
  betterTomorrow?: string;
  gratitude?: string;
}

export function useStoicJournal() {
  const [entries, setEntries] = useState<StoicJournalEntry[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try {
        setEntries(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const persist = (next: StoicJournalEntry[]) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setEntries(next);
  };

  const addEntry = (entry: Omit<StoicJournalEntry, "id" | "createdAt">) => {
    const newEntry: StoicJournalEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    persist([newEntry, ...entries]);
    return newEntry;
  };

  const deleteEntry = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
  };

  const entriesForPeriodToday = (period: "morning" | "evening") => {
    const today = new Date().toDateString();
    return entries.filter(
      (e) => e.period === period && new Date(e.createdAt).toDateString() === today
    );
  };

  return { entries, addEntry, deleteEntry, entriesForPeriodToday };
}
