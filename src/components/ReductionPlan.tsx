import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Leaf, TrendingDown, Calendar, Info, Cigarette } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { z } from "zod";

interface ReductionPlanData {
  id: string;
  current_phase: number;
  phase_start_date: string;
  plan_start_date: string;
  initial_cigarettes_per_day: number;
  current_cigarettes_per_day: number;
}

const cigaretteSchema = z.object({
  initial: z.number().min(0, "Deve ser maior ou igual a 0").max(100, "Valor muito alto"),
  current: z.number().min(0, "Deve ser maior ou igual a 0").max(100, "Valor muito alto"),
});

const ReductionPlan = () => {
  const [plan, setPlan] = useState<ReductionPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingCigarettes, setEditingCigarettes] = useState(false);
  const [initialCigs, setInitialCigs] = useState("");
  const [currentCigs, setCurrentCigs] = useState("");
  const { toast } = useToast();

  const phaseInfo = {
    1: {
      title: "Etapa 1 – Ajuste Inicial",
      duration: "4 semanas",
      alcohol: {
        frequency: "2 dias por semana",
        limits: ["🍷 1 taça de vinho (150ml) ou", "🍺 2 latas de cerveja (350ml) ou", "🥃 5 doses pequenas (40ml)"],
      },
      tobacco: { target: "Reduzir 25% da quantidade diária" },
    },
    2: {
      title: "Etapa 2 – Moderação",
      duration: "4 semanas",
      alcohol: {
        frequency: "1 dia por semana",
        limits: ["🍷 1 taça de vinho ou", "🍺 1 lata de cerveja ou", "🥃 3 doses pequenas"],
      },
      tobacco: { target: "Reduzir mais 25% (50% do total)" },
    },
    3: {
      title: "Etapa 3 – Manutenção",
      duration: "Contínuo",
      alcohol: {
        frequency: "Apenas ocasiões especiais",
        limits: ["🍷 até 1 taça de vinho ou", "🍺 até 1 lata de cerveja ou", "🥃 até 2 doses pequenas"],
      },
      tobacco: { target: "Consumo eventual ou eliminação" },
    },
  };

  useEffect(() => {
    fetchOrCreatePlan();
  }, []);

  const fetchOrCreatePlan = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("reduction_plan")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: newPlan, error: insertError } = await supabase
          .from("reduction_plan")
          .insert({ user_id: session.user.id, current_phase: 1 })
          .select()
          .single();

        if (insertError) throw insertError;
        setPlan(newPlan);
      } else {
        setPlan(data);
        setInitialCigs(data.initial_cigarettes_per_day.toString());
        setCurrentCigs(data.current_cigarettes_per_day.toString());
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCigarettes = async () => {
    if (!plan) return;

    try {
      const validated = cigaretteSchema.parse({
        initial: parseInt(initialCigs) || 0,
        current: parseInt(currentCigs) || 0,
      });

      await supabase
        .from("reduction_plan")
        .update({
          initial_cigarettes_per_day: validated.initial,
          current_cigarettes_per_day: validated.current,
        })
        .eq("id", plan.id);

      toast({ title: "Atualizado!" });
      setEditingCigarettes(false);
      fetchOrCreatePlan();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const advancePhase = async () => {
    if (!plan || plan.current_phase >= 3) return;
    await supabase.from("reduction_plan").update({ current_phase: plan.current_phase + 1 }).eq("id", plan.id);
    toast({ title: "Parabéns! 🎉", description: "Você avançou de etapa!" });
    fetchOrCreatePlan();
  };

  if (loading) return <div>Carregando...</div>;
  if (!plan) return null;

  const currentPhaseInfo = phaseInfo[plan.current_phase as keyof typeof phaseInfo];
  const reductionPercent = plan.initial_cigarettes_per_day > 0 
    ? Math.round(((plan.initial_cigarettes_per_day - plan.current_cigarettes_per_day) / plan.initial_cigarettes_per_day) * 100)
    : 0;

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <CardTitle className="text-xl">Plano Integrado</CardTitle>
          </div>
          <Badge variant="secondary">Etapa {plan.current_phase}/3</Badge>
        </div>
        <CardDescription>Álcool e cigarro sob controle</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-primary/5">
          <h3 className="font-semibold">{currentPhaseInfo.title}</h3>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Álcool: {currentPhaseInfo.alcohol.frequency}
          </h4>
          {currentPhaseInfo.alcohol.limits.map((limit, i) => (
            <p key={i} className="text-xs text-muted-foreground pl-6">{limit}</p>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Cigarette className="w-4 h-4" />
            Tabaco: {currentPhaseInfo.tobacco.target}
          </h4>
          {!editingCigarettes ? (
            <div className="pl-6 space-y-2">
              {plan.initial_cigarettes_per_day > 0 && (
                <p className="text-xs text-muted-foreground">
                  Inicial: {plan.initial_cigarettes_per_day}/dia → Atual: {plan.current_cigarettes_per_day}/dia
                  {reductionPercent > 0 && <span className="ml-2 text-primary">↓ {reductionPercent}%</span>}
                </p>
              )}
              <Button size="sm" variant="outline" onClick={() => setEditingCigarettes(true)}>
                {plan.initial_cigarettes_per_day > 0 ? "Atualizar" : "Configurar"}
              </Button>
            </div>
          ) : (
            <div className="pl-6 space-y-2">
              <Input
                type="number"
                placeholder="Cigarros iniciais/dia"
                value={initialCigs}
                onChange={(e) => setInitialCigs(e.target.value)}
                className="max-w-[200px]"
              />
              <Input
                type="number"
                placeholder="Cigarros atuais/dia"
                value={currentCigs}
                onChange={(e) => setCurrentCigs(e.target.value)}
                className="max-w-[200px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleUpdateCigarettes}>Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => setEditingCigarettes(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </div>

        {plan.current_phase < 3 && (
          <Button onClick={advancePhase} className="w-full">Avançar para próxima etapa</Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ReductionPlan;
