import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, Trash2, Star } from "lucide-react";
import { useDreams } from "@/hooks/useDreams";
import { useLocalConsumption } from "@/hooks/useLocalUser";
import { motion } from "framer-motion";

const EMOJIS = ["✈️", "🏍️", "🚗", "🏠", "💍", "🎓", "👨‍👩‍👧", "💪", "🎸", "📚", "🏖️", "💰"];

const DreamsBoard = () => {
  const { dreams, addDream, removeDream } = useDreams();
  const { records } = useLocalConsumption();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("✈️");
  const [target, setTarget] = useState("");

  const totalSaved = useMemo(() => {
    // Heurística: economia = custo médio diário × dias limpos
    if (records.length < 2) return 0;
    const withCost = records.filter(r => r.cost && r.cost > 0);
    if (withCost.length === 0) return 0;
    const dates = records.map(r => new Date(r.consumptionDate).getTime());
    const span = Math.max(1, (Math.max(...dates) - Math.min(...dates)) / 86400000);
    const avgPerDay = withCost.reduce((s, r) => s + (r.cost || 0), 0) / span;
    const lastDate = new Date(Math.max(...dates));
    const cleanDays = Math.max(0, (Date.now() - lastDate.getTime()) / 86400000);
    return avgPerDay * cleanDays * 0.5;
  }, [records]);

  const submit = () => {
    const t = parseFloat(target);
    if (!title.trim() || !t || t <= 0) return;
    addDream({ title: title.trim(), emoji, targetCost: t });
    setTitle(""); setTarget(""); setEmoji("✈️"); setOpen(false);
  };

  const fmt = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" /> Sonhos & Metas
        </CardTitle>
        <CardDescription>Conecte sua sobriedade aos seus sonhos. Você economizou cerca de <strong>{fmt(totalSaved)}</strong>.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full"><Sparkles className="w-4 h-4 mr-2" /> Adicionar sonho</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Qual é o seu sonho?</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Escolha um ícone</Label>
                <div className="grid grid-cols-6 gap-2 mt-1">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setEmoji(e)}
                      className={`text-2xl p-2 rounded border ${emoji === e ? "border-primary bg-primary/10" : "border-border"}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Sonho</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: viajar para a praia com a família" maxLength={80} />
              </div>
              <div>
                <Label>Custo estimado (R$)</Label>
                <Input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="2500" />
              </div>
              <Button onClick={submit} className="w-full">Salvar sonho</Button>
            </div>
          </DialogContent>
        </Dialog>

        {dreams.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Crie seu primeiro sonho. ✨</p>
        ) : (
          <div className="space-y-3">
            {dreams.map((d) => {
              const pct = Math.min(100, (totalSaved / d.targetCost) * 100);
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg border bg-muted/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl">{d.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{d.title}</p>
                        <p className="text-xs text-muted-foreground">Meta: {fmt(d.targetCost)}</p>
                      </div>
                    </div>
                    <button onClick={() => removeDream(d.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 space-y-1">
                    <Progress value={pct} className="h-2" />
                    <p className="text-xs text-right text-muted-foreground">
                      {pct.toFixed(0)}% • {fmt(totalSaved)} de {fmt(d.targetCost)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DreamsBoard;
