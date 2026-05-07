import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import { calcXp, levelFromXp } from "@/lib/levels";
import { useLocalConsumption, calculateDaysClean } from "@/hooks/useLocalUser";
import { useJournal } from "@/hooks/useJournal";
import { useDreams } from "@/hooks/useDreams";

const LEVEL_KEY = "vivaLivre_lastLevel";

const LevelCard = () => {
  const { records } = useLocalConsumption();
  const { entries } = useJournal();
  const { dreams } = useDreams();
  const days = calculateDaysClean(records);
  const xp = calcXp({ daysClean: days, journalEntries: entries.length, dreamsCount: dreams.length });
  const { current, next, progress } = levelFromXp(xp);
  const [levelUp, setLevelUp] = useState<string | null>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    const lastIdx = parseInt(localStorage.getItem(LEVEL_KEY) || "-1", 10);
    if (firstRender.current) {
      firstRender.current = false;
      localStorage.setItem(LEVEL_KEY, String(current.index));
      return;
    }
    if (current.index > lastIdx) {
      setLevelUp(current.name);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      localStorage.setItem(LEVEL_KEY, String(current.index));
      setTimeout(() => setLevelUp(null), 3500);
    }
  }, [current.index]);

  return (
    <Card className="border-primary/30 bg-gradient-card overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="w-5 h-5 text-primary" />
          Nível {current.index + 1} — {current.emoji} {current.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground italic">"{current.description}"</p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-medium">{xp} XP</span>
            <span className="text-muted-foreground">
              {next ? `${next.minXp - xp} XP para ${next.name}` : "Nível máximo"}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>

      <AnimatePresence>
        {levelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-none"
          >
            <div className="text-center space-y-3 p-8">
              <div className="text-7xl">{current.emoji}</div>
              <div className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                Você subiu de nível!
              </div>
              <div className="text-xl">{levelUp}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default LevelCard;
