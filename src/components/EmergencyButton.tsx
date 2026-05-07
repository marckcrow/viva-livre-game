import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldAlert, Wind, Heart } from "lucide-react";
import { useDreams } from "@/hooks/useDreams";

const PHRASES = [
  "Esse impulso vai passar. Você é mais forte do que ele.",
  "Respire. Em 10 minutos você vai se orgulhar de ter resistido.",
  "Cada vontade vencida é uma vitória do seu novo eu.",
  "Lembre por que você começou. Você merece essa liberdade.",
  "‘O Senhor é o meu pastor, nada me faltará.’ — Salmo 23",
];

const EmergencyButton = () => {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [seconds, setSeconds] = useState(120);
  const { dreams } = useDreams();
  const phrase = PHRASES[Math.floor(Date.now() / 60000) % PHRASES.length];

  useEffect(() => {
    if (!open) return;
    setSeconds(120);
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const cycle = setInterval(() => {
      setPhase(p => (p === "in" ? "hold" : p === "hold" ? "out" : "in"));
    }, 4000);
    return () => clearInterval(cycle);
  }, [open]);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-destructive text-destructive-foreground rounded-full shadow-2xl shadow-destructive/40 p-4 flex items-center gap-2 font-semibold"
        aria-label="Modo emergência"
      >
        <ShieldAlert className="w-5 h-5" />
        <span className="hidden sm:inline">Vou recair</span>
      </motion.button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-destructive" /> Você não está sozinho
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 text-center">
            <div className="relative h-40 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ scale: 0.6, opacity: 0.4 }}
                  animate={{
                    scale: phase === "in" ? 1.4 : phase === "hold" ? 1.4 : 0.6,
                    opacity: 1,
                  }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="absolute w-32 h-32 rounded-full bg-primary/30 border-4 border-primary"
                />
              </AnimatePresence>
              <div className="relative font-semibold text-lg">
                {phase === "in" ? "Inspire" : phase === "hold" ? "Segure" : "Solte"}
              </div>
            </div>

            <div className="text-3xl font-bold tabular-nums">
              {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
            </div>
            <p className="text-xs text-muted-foreground -mt-3">Aguente 2 minutos. A vontade enfraquece.</p>

            <p className="italic text-sm border-l-2 border-primary pl-3 text-left">"{phrase}"</p>

            {dreams.length > 0 && (
              <div className="text-left text-sm bg-muted/40 p-3 rounded-lg">
                <p className="font-semibold mb-1 flex items-center gap-1">🌟 Lembre dos seus sonhos</p>
                <ul className="space-y-0.5">
                  {dreams.slice(0, 3).map(d => <li key={d.id}>{d.emoji} {d.title}</li>)}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                <Wind className="w-4 h-4 mr-2" /> Já passou
              </Button>
              <Button asChild variant="default">
                <a href="tel:188">Ligar para CVV 188</a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmergencyButton;
