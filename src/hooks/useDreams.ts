import { useEffect, useState } from "react";

const KEY = "vivaLivre_dreams";

export interface Dream {
  id: string;
  title: string;
  emoji: string;
  targetCost: number;
  createdAt: string;
}

export function useDreams() {
  const [dreams, setDreams] = useState<Dream[]>([]);

  useEffect(() => { load(); }, []);

  const load = () => {
    const stored = localStorage.getItem(KEY);
    if (stored) setDreams(JSON.parse(stored));
  };

  const save = (next: Dream[]) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setDreams(next);
  };

  const addDream = (d: Omit<Dream, "id" | "createdAt">) => {
    save([{ ...d, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString() }, ...dreams]);
  };

  const removeDream = (id: string) => save(dreams.filter(d => d.id !== id));

  return { dreams, addDream, removeDream };
}
