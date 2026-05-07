import { useEffect, useState } from "react";

const KEY = "vivaLivre_journal";

export interface JournalEntry {
  id: string;
  content: string;
  mood: "great" | "good" | "neutral" | "low" | "bad";
  aiResponse?: string;
  createdAt: string;
}

const MOOD_EMOJI: Record<JournalEntry["mood"], string> = {
  great: "😊", good: "🙂", neutral: "😐", low: "😔", bad: "😢",
};

export function moodLabel(m: JournalEntry["mood"]) {
  return { great: "Ótimo", good: "Bem", neutral: "Neutro", low: "Pra baixo", bad: "Difícil" }[m];
}
export function moodEmoji(m: JournalEntry["mood"]) { return MOOD_EMOJI[m]; }

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  useEffect(() => { load(); }, []);
  const load = () => {
    const s = localStorage.getItem(KEY);
    if (s) setEntries(JSON.parse(s));
  };
  const save = (next: JournalEntry[]) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setEntries(next);
  };
  const addEntry = (e: Omit<JournalEntry, "id" | "createdAt">) => {
    const entry: JournalEntry = { ...e, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString() };
    save([entry, ...entries]);
    return entry;
  };
  const updateEntry = (id: string, patch: Partial<JournalEntry>) => {
    save(entries.map(en => en.id === id ? { ...en, ...patch } : en));
  };
  const deleteEntry = (id: string) => save(entries.filter(en => en.id !== id));
  return { entries, addEntry, updateEntry, deleteEntry };
}
