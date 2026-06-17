import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, ShieldAlert, Sparkles, Loader2, TrendingDown, Activity, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useJournal, moodLabel } from "@/hooks/useJournal";
import RiskActionPlan from "./RiskActionPlan";
import { format } from "date-fns";

interface TriggerItem { name: string; evidence: string; severity: "low" | "medium" | "high"; }
interface AlertItem { title: string; action: string; }
interface Analysis {
  riskLevel: "low" | "medium" | "high";
  summary: string;
  triggers: TriggerItem[];
  patterns: string[];
  alerts: AlertItem[];
  affirmation: string;
  generatedAt: string;
}

const STORAGE_KEY = "vivaLivre_triggerAnalysis";

const riskStyles: Record<Analysis["riskLevel"], { label: string; cls: string; icon: typeof ShieldAlert }> = {
  low: { label: "Risco baixo", cls: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30", icon: Heart },
  medium: { label: "Atenção", cls: "bg-amber-500/15 text-amber-700 border-amber-500/30", icon: Activity },
  high: { label: "Risco elevado", cls: "bg-destructive/15 text-destructive border-destructive/30", icon: ShieldAlert },
};

const severityCls: Record<TriggerItem["severity"], string> = {
  low: "bg-emerald-500/10 text-emerald-700",
  medium: "bg-amber-500/10 text-amber-700",
  high: "bg-destructive/10 text-destructive",
};

const TriggerAnalysis = () => {
  const { entries } = useJournal();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  });

  const analyze = async () => {
    if (entries.length < 3) {
      toast({ title: "Poucas entradas", description: "Registre ao menos 3 entradas no diário para uma análise consistente.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const recent = entries.slice(0, 15).map(e => ({
        date: format(new Date(e.createdAt), "dd/MM"),
        mood: moodLabel(e.mood),
        content: e.content.slice(0, 400),
      }));
      const relapses = JSON.parse(localStorage.getItem("vivaLivre_relapses") || "[]");
      const since = Date.now() - 30 * 86400000;
      const recentRelapses = relapses.filter((r: any) => new Date(r.date || r.createdAt).getTime() > since).length;
      const daysClean = Number(localStorage.getItem("vivaLivre_daysClean") || 0);

      const { data, error } = await supabase.functions.invoke("ai-analysis", {
        body: { type: "triggers", data: { entries: recent, daysClean, recentRelapses } },
      });
      if (error) throw error;

      const raw = (data.response || "").trim();
      const jsonStr = raw.replace(/^```json\s*|\s*```$/g, "").match(/\{[\s\S]*\}/)?.[0];
      if (!jsonStr) throw new Error("Resposta inválida da IA");
      const parsed = JSON.parse(jsonStr);
      const result: Analysis = { ...parsed, generatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      setAnalysis(result);
      toast({ title: "Análise concluída", description: "Veja seus gatilhos e alertas abaixo." });
    } catch (e: any) {
      toast({ title: "Não foi possível analisar", description: e.message || "Tente novamente em instantes.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const RiskIcon = analysis ? riskStyles[analysis.riskLevel].icon : ShieldAlert;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" /> Análise de Gatilhos
        </CardTitle>
        <CardDescription>
          A IA lê seu diário emocional e sinaliza padrões e alertas preventivos antes de possíveis recaídas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={analyze} disabled={loading} className="w-full">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando seu diário...</>
            : <><Sparkles className="w-4 h-4 mr-2" /> {analysis ? "Atualizar análise" : "Analisar meu diário"}</>}
        </Button>

        {!analysis && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Registre algumas entradas no diário e clique para receber uma análise preventiva personalizada.
          </p>
        )}

        {analysis && (
          <div className="space-y-4">
            <div className={`flex items-start gap-3 p-3 rounded-lg border ${riskStyles[analysis.riskLevel].cls}`}>
              <RiskIcon className="w-5 h-5 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <div className="font-semibold text-sm">{riskStyles[analysis.riskLevel].label}</div>
                <p className="text-sm">{analysis.summary}</p>
              </div>
            </div>

            <RiskActionPlan
              triggerAnalysis={{
                riskLevel: analysis.riskLevel,
                summary: analysis.summary,
                triggers: analysis.triggers || [],
                patterns: analysis.patterns || [],
                alerts: analysis.alerts || [],
              }}
            />

            {analysis.triggers?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-primary" /> Gatilhos identificados
                </h4>
                <div className="space-y-2">
                  {analysis.triggers.map((t, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-muted/30 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm">{t.name}</span>
                        <Badge variant="outline" className={severityCls[t.severity]}>{t.severity}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground italic">"{t.evidence}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.patterns?.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-sm font-semibold">Padrões observados</h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  {analysis.patterns.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}

            {analysis.alerts?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Alertas preventivos
                </h4>
                {analysis.alerts.map((a, i) => (
                  <div key={i} className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-1">
                    <div className="font-medium text-sm">{a.title}</div>
                    <p className="text-sm text-muted-foreground">→ {a.action}</p>
                  </div>
                ))}
              </div>
            )}

            {analysis.affirmation && (
              <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 text-sm text-center italic">
                💙 {analysis.affirmation}
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Última análise: {format(new Date(analysis.generatedAt), "dd/MM HH:mm")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TriggerAnalysis;
