// Sistema de XP e níveis
export interface Level {
  index: number;
  name: string;
  minXp: number;
  emoji: string;
  description: string;
}

export const LEVELS: Level[] = [
  { index: 0, name: "Sobrevivente", minXp: 0, emoji: "🌱", description: "Cada dia é uma vitória." },
  { index: 1, name: "Guerreiro", minXp: 100, emoji: "⚔️", description: "Você está lutando com bravura." },
  { index: 2, name: "Restaurado", minXp: 350, emoji: "🛡️", description: "Sua força está sendo reconstruída." },
  { index: 3, name: "Mentor", minXp: 800, emoji: "🌟", description: "Sua jornada inspira outros." },
  { index: 4, name: "Exemplo", minXp: 1500, emoji: "👑", description: "Você é luz para quem ainda luta." },
];

export function calcXp({ daysClean, journalEntries, dreamsCount, communityPosts = 0 }: {
  daysClean: number; journalEntries: number; dreamsCount: number; communityPosts?: number;
}) {
  return daysClean * 10 + journalEntries * 5 + dreamsCount * 15 + communityPosts * 8;
}

export function levelFromXp(xp: number): { current: Level; next: Level | null; progress: number } {
  let current = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.minXp) current = l;
  const next = LEVELS[current.index + 1] || null;
  const progress = next ? ((xp - current.minXp) / (next.minXp - current.minXp)) * 100 : 100;
  return { current, next, progress: Math.min(100, Math.max(0, progress)) };
}
