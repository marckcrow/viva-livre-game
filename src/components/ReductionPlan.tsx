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

const cigaretteSchema = z.number().int().min(0).max(100);

const ReductionPlan = () => {
  const [plan, setPlan] = useState<ReductionPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [initialCigarettes, setInitialCigarettes] = useState("");
  const { toast } = useToast();

  const phaseInfo = {
    1: {
      title: "1️⃣ Etapa – Ajuste Inicial",
      duration: "4 semanas",
      alcohol: {
        frequency: "2 dias por semana",
        limits: ["🍷 1 taça de vinho (150ml) ou", "🍺 2 latas de cerveja (350ml) ou", "🥃 5 doses pequenas (40ml)"],
        tips: "Sempre acompanhado de comida e água. Evite misturar bebidas e beber sozinho.",
      },
      tobacco: {
        goal: "Reduzir 25% da quantidade diária",
        tips: "Adie o primeiro cigarro do dia. Inclua pausas para respiração profunda.",
      },
    },
    2: {
      title: "2️⃣ Etapa – Moderação e Reeducação",
      duration: "4 semanas",
      alcohol: {
        frequency: "1 dia por semana",
        limits: ["🍷 1 taça de vinho ou", "🍺 1 lata de cerveja ou", "🥃 3 doses pequenas"],
        tips: "Prefira ocasiões sociais. Evite repetir em dias seguidos.",
      },
      tobacco: {
        goal: "Reduzir mais 25% da quantidade original",
        tips: "Substitua o cigarro após refeições por água, caminhada ou escovação dos dentes.",
      },
    },
    3: {
      title: "3️⃣ Etapa – Manutenção e Liberdade",
      duration: "Contínuo",
      alcohol: {
        frequency: "Apenas ocasiões especiais",
        limits: ["🍷 até 1 taça de vinho ou", "🍺 até 1 lata de cerveja ou", "🥃 até 2 doses pequenas"],
        tips: "Intercale sempre com água e comida leve.",
      },
      tobacco: {
        goal: "Consumo eventual ou eliminar completamente",
        tips: "Estabeleça um 'Dia Zero' para parar de vez. Celebre marcos: 1 semana, 1 mês, 3 meses sem fumar.",
      },
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
        setShowSetup(true);
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

  const handleSetupPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cigarettesNum = parseInt(initialCigarettes) || 0;
    const validation = cigaretteSchema.safeParse(cigarettesNum);
    
    if (!validation.success) {
      toast({
        title: "Erro de validação",
        description: "Por favor, insira um número válido entre 0 e 100",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado");

      const { data: newPlan, error } = await supabase
        .from("reduction_plan")
        .insert({
          user_id: session.user.id,
          current_phase: 1,
          initial_cigarettes_per_day: cigarettesNum,
          current_cigarettes_per_day: cigarettesNum,
        })
        .select()
        .single();

      if (error) throw error;

      setPlan(newPlan);
      setShowSetup(false);
      toast({
        title: "Plano criado! 🌿",
        description: "Sua jornada de autocuidado começou!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar plano",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const advancePhase = async () => {
    if (!plan || plan.current_phase >= 3) return;

    const nextPhase = plan.current_phase + 1;
    let newCigaretteCount = plan.current_cigarettes_per_day;

    if (plan.initial_cigarettes_per_day > 0) {
      if (nextPhase === 2) {
        newCigaretteCount = Math.ceil(plan.initial_cigarettes_per_day * 0.5);
      } else if (nextPhase === 3) {
        newCigaretteCount = Math.ceil(plan.initial_cigarettes_per_day * 0.25);
      }
    }

    try {
      const { error } = await supabase
        .from("reduction_plan")
        .update({
          current_phase: nextPhase,
          phase_start_date: new Date().toISOString(),
          current_cigarettes_per_day: newCigaretteCount,
        })
        .eq("id", plan.id);

      if (error) throw error;

      toast({
        title: "Parabéns! 🎉",
        description: `Você avançou para a ${phaseInfo[nextPhase as keyof typeof phaseInfo].title}!`,
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
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (showSetup) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            Configurar Plano de Redução
          </CardTitle>
          <CardDescription>
            Vamos começar sua jornada de autocuidado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetupPlan} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cigarettes" className="flex items-center gap-2">
                <Cigarette className="w-4 h-4" />
                Quantos cigarros você fuma por dia atualmente?
              </Label>
              <Input
                id="cigarettes"
                type="number"
                min="0"
                max="100"
                placeholder="Ex: 8 (ou 0 se não fuma)"
                value={initialCigarettes}
                onChange={(e) => setInitialCigarettes(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Se você não fuma, coloque 0. Este plano também ajuda com o álcool.
              </p>
            </div>
            <Button type="submit" className="w-full">
              Iniciar Meu Plano
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (!plan) return null;

  const currentPhaseInfo = phaseInfo[plan.current_phase as keyof typeof phaseInfo];
  const daysInPhase = getDaysInPhase();
  const targetCigarettes = plan.current_cigarettes_per_day;

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <CardTitle className="text-2xl">Plano Integrado de Redução</CardTitle>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>🌿 Plano Integrado — Álcool e Tabaco</DialogTitle>
                <DialogDescription>
                  Redução gradual promovendo equilíbrio físico e mental
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 text-sm">
                {Object.entries(phaseInfo).map(([phase, info]) => (
                  <div key={phase} className="space-y-3 p-4 rounded-lg bg-muted/50">
                    <h3 className="font-semibold text-base">{info.title}</h3>
                    <p className="text-muted-foreground">Duração: {info.duration}</p>
                    
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">🍷 Álcool:</p>
                      <p className="text-muted-foreground">Frequência: {info.alcohol.frequency}</p>
                      <div className="pl-4 space-y-1">
                        {info.alcohol.limits.map((limit, i) => (
                          <p key={i} className="text-xs text-muted-foreground">{limit}</p>
                        ))}
                      </div>
                      <p className="text-xs italic text-muted-foreground">💡 {info.alcohol.tips}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="font-semibold text-sm flex items-center gap-1">
                        <Cigarette className="w-4 h-4" /> Tabaco:
                      </p>
                      <p className="text-muted-foreground">Meta: {info.tobacco.goal}</p>
                      <p className="text-xs italic text-muted-foreground">💡 {info.tobacco.tips}</p>
                    </div>
                  </div>
                ))}
                
                <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                  <h3 className="font-semibold">🌱 Dicas Gerais de Apoio</h3>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>💧 Hidratação constante — 2 litros de água/dia</li>
                    <li>🍊 Alimente-se bem — frutas cítricas e verduras ajudam</li>
                    <li>🧘‍♀️ Respiração e movimento diariamente</li>
                    <li>📲 Registre seu progresso e celebre conquistas</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Álcool e Tabaco · Redução gradual com autocuidado
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

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3 p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">🍷 Álcool</h4>
            </div>
            <p className="text-sm font-medium">{currentPhaseInfo.alcohol.frequency}</p>
            <div className="space-y-1">
              {currentPhaseInfo.alcohol.limits.map((limit, index) => (
                <p key={index} className="text-xs text-muted-foreground">{limit}</p>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic pt-2">
              💡 {currentPhaseInfo.alcohol.tips}
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <Cigarette className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">Tabaco</h4>
            </div>
            <p className="text-sm font-medium">{currentPhaseInfo.tobacco.goal}</p>
            {plan.initial_cigarettes_per_day > 0 && (
              <div className="space-y-1 pt-2">
                <p className="text-xs text-muted-foreground">
                  Inicial: {plan.initial_cigarettes_per_day} cigarros/dia
                </p>
                <p className="text-sm font-semibold text-primary">
                  Meta atual: {targetCigarettes} cigarros/dia
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground italic pt-2">
              💡 {currentPhaseInfo.tobacco.tips}
            </p>
          </div>
        </div>

        {plan.current_phase < 3 && (
          <div className="pt-4">
            <Button onClick={advancePhase} className="w-full" variant="default">
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

export default ReductionPlan;