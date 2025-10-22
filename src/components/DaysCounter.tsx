import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface DaysCounterProps {
  daysClean: number;
}

const DaysCounter = ({ daysClean }: DaysCounterProps) => {
  const [displayDays, setDisplayDays] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = daysClean;
    const duration = 1000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayDays(end);
        clearInterval(timer);
      } else {
        setDisplayDays(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [daysClean]);

  return (
    <Card className="bg-gradient-card shadow-glow border-primary/20">
      <CardContent className="pt-8 pb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Flame className="w-16 h-16 text-primary animate-pulse" />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Dias Limpo
          </p>
          <p className="text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            {displayDays}
          </p>
          <p className="text-sm text-muted-foreground">
            {daysClean === 0 && "Comece sua jornada hoje!"}
            {daysClean === 1 && "Primeiro passo dado! 🎉"}
            {daysClean > 1 && daysClean < 7 && "Você está indo bem! 💪"}
            {daysClean >= 7 && daysClean < 30 && "Força impressionante! ⭐"}
            {daysClean >= 30 && daysClean < 100 && "Você é incrível! 🏆"}
            {daysClean >= 100 && "Liberdade conquistada! 👑"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DaysCounter;
