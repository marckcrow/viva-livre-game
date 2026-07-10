import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Pause } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Step = 0 | 1 | 2 | 3;

const PausaEstoica = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [fato, setFato] = useState("");
  const [interpretacao, setInterpretacao] = useState("");
  const [resposta, setResposta] = useState("");
  const [seconds, setSeconds] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (open && step === 1) {
      setSeconds(30);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [open, step]);

  const reset = () => {
    setStep(0);
    setFato("");
    setInterpretacao("");
    setResposta("");
  };

  const close = () => {
    setOpen(false);
    setTimeout(reset, 200);
  };

  const registrar = () => {
    try {
      const key = "jornada_pausas";
      const list = JSON.parse(localStorage.getItem(key) ?? "[]");
      list.unshift({
        at: new Date().toISOString(),
        fato,
        interpretacao,
        resposta,
      });
      localStorage.setItem(key, JSON.stringify(list.slice(0, 100)));
      toast({ title: "Resposta registrada.", description: "Volte quando precisar de outra pausa." });
    } catch {}
    close();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 flex items-center justify-center"
        aria-label="Abrir Pausa Estoica"
      >
        <Shield className="w-6 h-6" />
      </button>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Pause className="w-5 h-5" /> Pausa Estoica
            </DialogTitle>
          </DialogHeader>

          {step === 0 && (
            <div className="space-y-4 text-center py-4">
              <p className="text-3xl font-display">Pare.</p>
              <p className="text-muted-foreground">Não responda imediatamente.</p>
              <Button className="w-full" onClick={() => setStep(1)}>
                Continuar
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 text-center py-4">
              <p className="text-2xl font-display">Respire</p>
              <div className="mx-auto relative flex items-center justify-center h-40 w-40">
                <div
                  className="absolute inset-0 rounded-full bg-primary/15 animate-[breath_4s_ease-in-out_infinite]"
                  style={{
                    // simple breath animation via inline keyframes fallback
                  }}
                />
                <span className="text-4xl font-display text-primary relative">
                  {seconds}s
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Inspire lentamente, segure, solte. Repita até o tempo acabar.
              </p>
              <Button className="w-full" onClick={() => setStep(2)}>
                Continuar
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 py-2">
              <p className="font-display text-xl">Separe</p>
              <div>
                <label className="text-sm font-medium">Qual é o fato?</label>
                <Textarea value={fato} onChange={(e) => setFato(e.target.value)} rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium">Qual é sua interpretação?</label>
                <Textarea
                  value={interpretacao}
                  onChange={(e) => setInterpretacao(e.target.value)}
                  rows={2}
                />
              </div>
              <Button className="w-full" onClick={() => setStep(3)}>
                Continuar
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 py-2">
              <p className="font-display text-xl">Escolha</p>
              <label className="text-sm font-medium">
                Qual resposta está de acordo com seus valores?
              </label>
              <Textarea value={resposta} onChange={(e) => setResposta(e.target.value)} rows={3} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button onClick={registrar} className="w-full">
                  Registrar resposta
                </Button>
                <Button variant="outline" onClick={close}>
                  Voltar ao meu dia
                </Button>
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Preciso de mais tempo
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes breath {
          0%, 100% { transform: scale(0.7); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default PausaEstoica;
