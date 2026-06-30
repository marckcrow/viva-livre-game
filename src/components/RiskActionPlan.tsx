import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Wind, Droplets, Activity, Phone, PenLine, Sparkles, Anchor,
  LifeBuoy, Loader2, ShieldCheck, Clock, Ban, Heart, MessageCircle,
} from "lucide-react";

interface ImmediateStep {
  minutes: number;
  title: string;
  description: string;
  icon?: string;
}
interface NextHourItem { title: string; description: string; }
interface EmergencyContact { name: string; contact: string; when: string; }
interface ActionPlan {
  title: string;
  intro: string;
  immediateSteps: ImmediateStep[];
  nextHours: NextHourItem[];
  avoid: string[];
  emergencyContacts: EmergencyContact[];
  mantra: string;
  generatedAt: string;
}

const STORAGE_KEY = "vivaLivre_actionPlan";

// Whitelist de serviços públicos e legítimos de apoio no Brasil.
// Qualquer contato fora desta lista é descartado para evitar exibição
// de dados sensíveis ou pessoais gerados/alucinados pela IA.
const TRUSTED_CONTACTS: Record<string, { name: string; contact: string; when: string }> = {
  "188": {
    name: "CVV - Centro de Valorização da Vida",
    contact: "188",
    when: "Apoio emocional e prevenção do suicídio, 24h, ligação gratuita",
  },
  "190": {
    name: "Polícia Militar",
    contact: "190",
    when: "Emergências de segurança",
  },
  "192": {
    name: "SAMU - Emergência Médica",
    contact: "192",
    when: "Emergência médica imediata",
  },
  "180": {
    name: "Central de Atendimento à Mulher",
    contact: "180",
    when: "Situações de violência contra a mulher",
  },
  "132": {
    name: "Disque Saúde / Dependência Química",
    contact: "132",
    when: "Orientação sobre álcool, tabaco e outras drogas",
  },
};

const sanitizeContacts = (list: EmergencyContact[] = []): EmergencyContact[] => {
  const seen = new Set<string>();
  const safe: EmergencyContact[] = [];
  for (const c of list) {
    const digits = (c?.contact || "").replace(/\D/g, "");
    const trusted = TRUSTED_CONTACTS[digits];
    if (!trusted || seen.has(digits)) continue;
    seen.add(digits);
    // Usa SEMPRE o nome/descrição da whitelist, ignorando texto vindo da IA.
    safe.push(trusted);
  }
  // Garante ao menos o CVV como apoio padrão.
  if (safe.length === 0) safe.push(TRUSTED_CONTACTS["188"]);
  return safe;
};

const iconMap: Record<string, typeof Wind> = {
  breath: Wind,
  water: Droplets,
  move: Activity,
  call: Phone,
  write: PenLine,
  distract: Sparkles,
  ground: Anchor,
};

interface Props {
  triggerAnalysis: {
    riskLevel: "low" | "medium" | "high";
    summary: string;
    triggers: { name: string; severity: string }[];
    patterns: string[];
    alerts: { title: string; action: string }[];
  };
}

const RiskActionPlan = ({ triggerAnalysis }: Props) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<ActionPlan | null>(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  });
  const [done, setDone] = useState<Record<number, boolean>>({});

  const generate = async () => {
    setLoading(true);
    try {
      const daysClean = Number(localStorage.getItem("vivaLivre_daysClean") || 0);
      const relapses = JSON.parse(localStorage.getItem("vivaLivre_relapses") || "[]");
      const since = Date.now() - 30 * 86400000;
      const recentRelapses = relapses.filter(
        (r: any) => new Date(r.date || r.createdAt).getTime() > since
      ).length;

      const { data, error } = await supabase.functions.invoke("ai-analysis", {
        body: { type: "action_plan", data: { ...triggerAnalysis, daysClean, recentRelapses } },
      });
      if (error) throw error;

      const raw = (data.response || "").trim();
      const jsonStr = raw.replace(/^```json\s*|\s*```$/g, "").match(/\{[\s\S]*\}/)?.[0];
      if (!jsonStr) throw new Error("Resposta inválida da IA");
      const parsed = JSON.parse(jsonStr);
      parsed.emergencyContacts = sanitizeContacts(parsed.emergencyContacts);
      const result: ActionPlan = { ...parsed, generatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      setPlan(result);
      setDone({});
      toast({ title: "Plano pronto", description: "Siga os passos no seu ritmo." });
    } catch (e: any) {
      toast({
        title: "Não foi possível gerar o plano",
        description: e.message || "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const riskCta =
    triggerAnalysis.riskLevel === "high"
      ? "Preciso de ajuda agora"
      : triggerAnalysis.riskLevel === "medium"
      ? "Gerar plano de ação"
      : "Plano preventivo de cuidado";

  const completed = plan ? Object.values(done).filter(Boolean).length : 0;
  const total = plan?.immediateSteps.length || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full"
          variant={triggerAnalysis.riskLevel === "high" ? "destructive" : "default"}
        >
          <LifeBuoy className="w-4 h-4 mr-2" />
          {riskCta}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {plan?.title || "Plano de ação imediato"}
          </DialogTitle>
          <DialogDescription>
            {plan?.intro ||
              "Vamos transformar o alerta em passos concretos que você pode seguir agora."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button onClick={generate} disabled={loading} className="w-full" variant="outline">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Montando seu plano...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {plan ? "Gerar novo plano" : "Gerar plano personalizado"}
              </>
            )}
          </Button>

          {plan && (
            <>
              {total > 0 && (
                <div className="text-xs text-muted-foreground text-center">
                  Progresso: {completed} de {total} passos concluídos
                </div>
              )}

              <section className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" /> Agora (próximos minutos)
                </h4>
                {plan.immediateSteps.map((step, i) => {
                  const Icon = iconMap[step.icon || ""] || Sparkles;
                  return (
                    <label
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        done[i] ? "bg-emerald-500/5 border-emerald-500/30" : "bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      <Checkbox
                        checked={!!done[i]}
                        onCheckedChange={(v) => setDone((d) => ({ ...d, [i]: !!v }))}
                        className="mt-0.5"
                      />
                      <Icon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-medium ${done[i] ? "line-through opacity-60" : ""}`}>
                            {step.title}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">~{step.minutes} min</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </label>
                  );
                })}
              </section>

              {plan.nextHours?.length > 0 && (
                <section className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-primary" /> Nas próximas horas
                  </h4>
                  {plan.nextHours.map((n, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-primary/5 space-y-0.5">
                      <div className="text-sm font-medium">{n.title}</div>
                      <p className="text-xs text-muted-foreground">{n.description}</p>
                    </div>
                  ))}
                </section>
              )}

              {plan.avoid?.length > 0 && (
                <section className="space-y-1.5">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5">
                    <Ban className="w-4 h-4 text-destructive" /> Evite agora
                  </h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    {plan.avoid.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </section>
              )}

              {plan.emergencyContacts?.length > 0 && (
                <section className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-destructive" /> Apoio imediato
                  </h4>
                  {plan.emergencyContacts.map((c, i) => (
                    <a
                      key={i}
                      href={`tel:${c.contact.replace(/\D/g, "")}`}
                      className="block p-3 rounded-lg border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{c.name}</span>
                        <span className="text-sm font-mono text-destructive">{c.contact}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.when}</p>
                    </a>
                  ))}
                </section>
              )}

              {plan.mantra && (
                <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 text-sm text-center italic">
                  <MessageCircle className="w-4 h-4 inline mr-1 text-primary" />
                  "{plan.mantra}"
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskActionPlan;
