import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Leaf, TrendingDown, Calendar, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AlcoholReductionPlanData {
  id: string;
  current_phase: number;
  phase_start_date: string;
  plan_start_date: string;
}

const AlcoholReductionPlan = () => {
  const [plan, setPlan] = useState<AlcoholReductionPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const phaseInfo = {
    1: {
      title: "Fase 1 – Ajuste Inicial",
      duration: "4 semanas",
      frequency: "2 dias por semana",
      limits: [
        "🍷 1 taça de vinho (150ml) ou",
        "🍺 2 latas de cerveja (350ml) ou",
        "🥃 5 doses pequenas (40ml)",
      ],
      tips: "Sempre junto de alimentação e 1 copo d'água entre cada dose.",
    },
    2: {
      title: "Fase 2 – Moderação Consciente",
      duration: "4 semanas",
      frequency: "1 dia por semana",
      limits: [
        "🍷 1 taça de vinho ou",
        "🍺 1 lata de cerveja ou",
        "🥃 3 doses pequenas",
      ],
      tips: "Prefira ocasiões sociais e celebrações. Evite repetir em dias seguidos.",
    },
    3: {
      title: "Fase 3 – Manutenção e Equilíbrio",
      duration: "Contínuo",
      frequency: "Apenas ocasiões especiais",
      limits: [
        "🍷 até 1 taça de vinho ou",
        "🍺 até 1 lata de cerveja ou",
        "🥃 até 2 doses pequenas",
      ],
      tips: "Intercale sempre com água e comida leve. Mantenha foco em hidratação e bem-estar.",
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
        .from("alcohol_reduction_plan")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: newPlan, error: insertError } = await supabase
          .from("alcohol_reduction_plan")
          .insert({
            user_id: session.user.id,
            current_phase: 1,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setPlan(newPlan);
      } else {
        setPlan(data);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar plano",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const advancePhase = async () => {
    if (!plan || plan.current_phase >= 3) return;

    try {
      const { error } = await supabase
        .from("alcohol_reduction_plan")
        .update({
          current_phase: plan.current_phase + 1,
          phase_start_date: new Date().toISOString(),
        })
        .eq("id", plan.id);

      if (error) throw error;

      toast({
        title: "Parabéns! 🎉",
        description: `Você avançou para a ${phaseInfo[plan.current_phase + 1 as keyof typeof phaseInfo].title}!`,
      });

      fetchOrCreatePlan();
    } catch (error: any) {
      toast({
        title: "Erro ao avançar fase",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getDaysInPhase = () => {
    if (!plan) return 0;
    const start = new Date(plan.phase_start_date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!plan) return null;

  const currentPhaseInfo = phaseInfo[plan.current_phase as keyof typeof phaseInfo];
  const daysInPhase = getDaysInPhase();

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <CardTitle className="text-2xl">Plano de Redução Consciente</CardTitle>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>🍃 Plano de Redução Consciente de Álcool</DialogTitle>
                <DialogDescription>
                  Reduza gradualmente o consumo de bebidas alcoólicas, mantendo prazer e convivência social, sem exageros.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 text-sm">
                {Object.entries(phaseInfo).map(([phase, info]) => (
                  <div key={phase} className="space-y-2 p-4 rounded-lg bg-muted/50">
                    <h3 className="font-semibold text-base">{info.title}</h3>
                    <p className="text-muted-foreground">Duração: {info.duration}</p>
                    <p className="font-medium">Frequência: {info.frequency}</p>
                    <div className="space-y-1">
                      <p className="font-medium">Limites:</p>
                      {info.limits.map((limit, i) => (
                        <p key={i} className="text-muted-foreground">{limit}</p>
                      ))}
                    </div>
                    <p className="text-muted-foreground italic">💡 {info.tips}</p>
                  </div>
                ))}
                <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                  <h3 className="font-semibold">💡 Dicas Saudáveis de Substituição</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>🍹 Faça drinks sem álcool (mocktails com frutas e ervas)</li>
                    <li>💧 Hidrate-se bem: 2 litros de água por dia</li>
                    <li>🧘‍♂️ Inclua práticas de relaxamento: caminhada, alongamento</li>
                    <li>📘 Registre cada semana sem bebida - visualize seu progresso</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Objetivo: Reduzir gradualmente o consumo, mantendo equilíbrio e bem-estar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5">
          <div>
            <h3 className="font-semibold text-lg">{currentPhaseInfo.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              {daysInPhase} dias nesta fase
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Fase {plan.current_phase}/3
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Frequência: {currentPhaseInfo.frequency}</h4>
          </div>
          <div className="space-y-2 pl-7">
            <p className="font-medium text-sm">Limites recomendados:</p>
            {currentPhaseInfo.limits.map((limit, index) => (
              <p key={index} className="text-sm text-muted-foreground">{limit}</p>
            ))}
          </div>
          <p className="text-sm text-muted-foreground italic pl-7 pt-2">
            💡 {currentPhaseInfo.tips}
          </p>
        </div>

        {plan.current_phase < 3 && (
          <div className="pt-4">
            <Button 
              onClick={advancePhase} 
              className="w-full"
              variant="default"
            >
              Avançar para próxima fase
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Avance quando sentir que completou os objetivos desta fase
            </p>
          </div>
        )}

        {plan.current_phase === 3 && (
          <div className="text-center p-4 rounded-lg bg-primary/5">
            <p className="text-sm font-medium text-primary">
              🎉 Parabéns! Você está na fase de manutenção contínua.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Continue focando no equilíbrio e bem-estar!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlcoholReductionPlan;