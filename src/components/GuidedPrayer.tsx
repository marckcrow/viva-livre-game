import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Play, Pause, RotateCcw, Check, Flame } from "lucide-react";
import { toast } from "sonner";

const PRAYER_DURATION = 180; // 3 minutos
const STORAGE_KEY = "vivalivre_prayer_log";

interface PrayerStep {
  time: number; // segundos a partir do início
  title: string;
  text: string;
}

const steps: PrayerStep[] = [
  {
    time: 0,
    title: "1. Acolhimento (0:00 - 0:30)",
    text: "Respire fundo. Coloque a mão sobre o coração. Em silêncio, diga: 'Aqui estou. Hoje, escolho cuidar de mim.' Sinta que você não está sozinho — algo maior caminha com você.",
  },
  {
    time: 30,
    title: "2. Entrega (0:30 - 1:15)",
    text: "Pense em uma coisa que está pesada hoje — uma vontade, um medo, uma mágoa. Imagine entregar isso nas mãos do Ser Superior em quem você acredita. 'Lança sobre o Senhor o teu cuidado, e Ele te susterá.' (Salmo 55,22)",
  },
  {
    time: 75,
    title: "3. Gratidão (1:15 - 2:00)",
    text: "Lembre de 3 coisas boas do seu dia ou da sua vida — pequenas que sejam. Um café, um sorriso, mais um dia respirando. Agradeça em silêncio. 'Em tudo dai graças.' (1 Tessalonicenses 5,18)",
  },
  {
    time: 120,
    title: "4. Pedido de Força (2:00 - 2:30)",
    text: "Peça, com palavras simples: 'Me dá força para hoje. Só hoje.' Não precisa de mais. 'A minha graça te basta, porque a força se aperfeiçoa na fraqueza.' (2 Coríntios 12,9)",
  },
  {
    time: 150,
    title: "5. Encerramento (2:30 - 3:00)",
    text: "Respire fundo três vezes. Sorria suavemente. Diga: 'Eu sou amado. Eu sou capaz. Hoje eu venço.' Abra os olhos devagar e siga em paz. 🙏",
  },
];

interface PrayerLog {
  dates: string[]; // YYYY-MM-DD
  streak: number;
  total: number;
}

const loadLog = (): PrayerLog => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { dates: [], streak: 0, total: 0 };
};

const todayStr = () => new Date().toISOString().split("T")[0];

const computeStreak = (dates: string[]): number => {
  if (dates.length === 0) return 0;
  const sorted = [...new Set(dates)].sort().reverse();
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < sorted.length; i++) {
    const d = new Date(sorted[i]);
    d.setHours(0, 0, 0, 0);
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    if (d.getTime() === expected.getTime()) {
      streak++;
    } else if (i === 0) {
      // Permite que o streak ainda conte se a última oração foi ontem
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (d.getTime() === yesterday.getTime()) {
        streak++;
        today.setDate(today.getDate() - 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }
  return streak;
};

const GuidedPrayer = () => {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<PrayerLog>(loadLog);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= PRAYER_DURATION) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          setRunning(false);
          completePrayer();
          return PRAYER_DURATION;
        }
        return e + 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  const completePrayer = () => {
    const today = todayStr();
    const newLog: PrayerLog = {
      ...log,
      dates: log.dates.includes(today) ? log.dates : [...log.dates, today],
      total: log.total + 1,
    };
    newLog.streak = computeStreak(newLog.dates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLog));
    setLog(newLog);
    toast.success("Oração concluída! 🙏", {
      description: `${newLog.streak} ${newLog.streak === 1 ? "dia" : "dias"} de constância. Que a paz fique com você.`,
    });
  };

  const handleStart = () => {
    if (elapsed >= PRAYER_DURATION) setElapsed(0);
    setRunning(true);
  };

  const handlePause = () => setRunning(false);

  const handleReset = () => {
    setRunning(false);
    setElapsed(0);
  };

  const currentStep =
    [...steps].reverse().find((s) => elapsed >= s.time) || steps[0];
  const progress = (elapsed / PRAYER_DURATION) * 100;
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const totalMinutes = Math.floor(PRAYER_DURATION / 60);
  const totalSeconds = PRAYER_DURATION % 60;
  const prayedToday = log.dates.includes(todayStr());

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Oração Guiada de 3 Minutos
            </CardTitle>
            <CardDescription className="mt-1">
              Um momento curto de pausa, entrega e gratidão. Para qualquer fé.
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            {prayedToday && (
              <Badge variant="default" className="gap-1">
                <Check className="w-3 h-3" /> Feita hoje
              </Badge>
            )}
            {log.streak > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Flame className="w-3 h-3" /> {log.streak} {log.streak === 1 ? "dia" : "dias"} seguidos
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-4 min-h-[140px]">
          <p className="text-sm font-semibold text-primary mb-2">
            {currentStep.title}
          </p>
          <p className="text-sm leading-relaxed text-foreground/90">
            {currentStep.text}
          </p>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
            <span>
              {totalMinutes}:{totalSeconds.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {!running ? (
            <Button onClick={handleStart} className="flex-1" size="lg">
              <Play className="w-4 h-4 mr-2" />
              {elapsed === 0 ? "Iniciar Oração" : elapsed >= PRAYER_DURATION ? "Orar Novamente" : "Continuar"}
            </Button>
          ) : (
            <Button onClick={handlePause} variant="secondary" className="flex-1" size="lg">
              <Pause className="w-4 h-4 mr-2" />
              Pausar
            </Button>
          )}
          {elapsed > 0 && (
            <Button onClick={handleReset} variant="outline" size="lg">
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {log.total > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            Você já fez {log.total} {log.total === 1 ? "oração" : "orações"} guiadas. Continue firme. 💚
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default GuidedPrayer;
