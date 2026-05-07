import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useLocalConsumption } from "@/hooks/useLocalUser";

const RealtimeCounter = () => {
  const { getLastConsumptionDate } = useLocalConsumption();
  const [now, setNow] = useState(Date.now());
  const last = getLastConsumptionDate();
  const startedAt = last ? last.getTime() : (() => {
    const p = localStorage.getItem("vivaLivre_progress");
    return p ? new Date(JSON.parse(p).startDate).getTime() : Date.now();
  })();
  const recordRef = useRef<number>(parseInt(localStorage.getItem("vivaLivre_record") || "0", 10));

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const diff = Math.max(0, now - startedAt);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  if (days > recordRef.current) {
    recordRef.current = days;
    localStorage.setItem("vivaLivre_record", String(days));
  }

  const Box = ({ value, label }: { value: number; label: string }) => (
    <div className="text-center px-2">
      <motion.div
        key={value}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl md:text-4xl font-bold tabular-nums bg-gradient-hero bg-clip-text text-transparent"
      >
        {String(value).padStart(2, "0")}
      </motion.div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );

  return (
    <Card className="bg-gradient-card shadow-glow border-primary/20 overflow-hidden">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center justify-center gap-2 mb-3 text-primary">
          <Flame className="w-5 h-5 animate-pulse" />
          <span className="text-sm font-medium uppercase tracking-wider">Sobriedade em tempo real</span>
        </div>
        <div className="flex justify-center divide-x divide-border/40">
          <Box value={days} label="Dias" />
          <Box value={hours} label="Horas" />
          <Box value={minutes} label="Min" />
          <Box value={seconds} label="Seg" />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          🏆 Recorde pessoal: <strong className="text-foreground">{recordRef.current}</strong> dias
        </p>
      </CardContent>
    </Card>
  );
};

export default RealtimeCounter;
