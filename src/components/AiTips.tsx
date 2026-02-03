import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Loader2, Lightbulb, Heart, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { shareToWhatsApp } from "@/utils/shareToWhatsApp";
import { useLocalConsumption, useLocalPlan } from "@/hooks/useLocalUser";

interface AiTipsProps {
  daysClean: number;
}

interface AiTipsData {
  tips: string[];
  motivation: string;
}

const LOCAL_TIPS_KEY = "vivaLivre_aiTips";
const LOCAL_TIPS_DATE_KEY = "vivaLivre_aiTipsDate";

const AiTips = ({ daysClean }: AiTipsProps) => {
  const [loading, setLoading] = useState(false);
  const [tipsData, setTipsData] = useState<AiTipsData | null>(null);
  const { toast } = useToast();
  const { records } = useLocalConsumption();
  const { plan } = useLocalPlan();

  useEffect(() => {
    loadStoredTips();
  }, []);

  const loadStoredTips = () => {
    const stored = localStorage.getItem(LOCAL_TIPS_KEY);
    const storedDate = localStorage.getItem(LOCAL_TIPS_DATE_KEY);
    
    if (stored && storedDate) {
      const today = new Date().toISOString().split("T")[0];
      if (storedDate === today) {
        try {
          setTipsData(JSON.parse(stored));
        } catch {
          // Invalid stored data, will fetch new
        }
      }
    }
  };

  const fetchNewTips = async () => {
    setLoading(true);

    try {
      const recentConsumptions = records.filter((r) => {
        const date = new Date(r.consumptionDate);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      }).length;

      const lastConsumption = records.length > 0 
        ? records.sort((a, b) => new Date(b.consumptionDate).getTime() - new Date(a.consumptionDate).getTime())[0]
        : null;

      const { data, error } = await supabase.functions.invoke("ai-analysis", {
        body: {
          type: "daily_tips",
          data: {
            daysClean,
            recentConsumptions,
            currentPhase: plan?.currentPhase || 1,
            lastConsumption: lastConsumption 
              ? `${lastConsumption.consumptionType} em ${new Date(lastConsumption.consumptionDate).toLocaleDateString("pt-BR")}`
              : "Nenhum registro",
          },
        },
      });

      if (error) throw error;

      // Try to parse JSON from response
      let parsedData: AiTipsData;
      try {
        // The response might have markdown code blocks, try to extract JSON
        const responseText = data.response;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found");
        }
      } catch {
        // If parsing fails, create structured data from text response
        parsedData = {
          tips: [
            "Mantenha-se hidratado e pratique atividade física leve",
            "Busque apoio de pessoas queridas quando sentir dificuldade",
            "Celebre cada pequena vitória no seu caminho",
          ],
          motivation: data.response.substring(0, 200) || "Continue firme! Cada dia é uma nova conquista.",
        };
      }

      setTipsData(parsedData);
      
      // Store for today
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem(LOCAL_TIPS_KEY, JSON.stringify(parsedData));
      localStorage.setItem(LOCAL_TIPS_DATE_KEY, today);

      toast({
        title: "Dicas atualizadas!",
        description: "Novas dicas personalizadas foram geradas.",
      });
    } catch (error: any) {
      console.error("Error fetching tips:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar novas dicas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShareTips = () => {
    if (!tipsData) return;
    
    let shareText = "🌟 *Viva Livre - Dicas do Dia*\n\n";
    shareText += "💡 *Dicas:*\n";
    tipsData.tips.forEach((tip, index) => {
      shareText += `${index + 1}. ${tip}\n`;
    });
    shareText += `\n💚 *Motivação:*\n${tipsData.motivation}`;
    shareText += "\n\n---\n🚀 Baixe o app Viva Livre e comece sua jornada!";
    
    shareToWhatsApp(shareText);
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Dicas da IA para Hoje
          </CardTitle>
          <div className="flex gap-1">
            {tipsData && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShareTips}
                className="h-8"
                title="Compartilhar no WhatsApp"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchNewTips}
              disabled={loading}
              className="h-8"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tipsData ? (
          <>
            <div className="space-y-2">
              {tipsData.tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg"
                >
                  <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>

            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm font-medium">{tipsData.motivation}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Clique para gerar dicas personalizadas com IA
            </p>
            <Button onClick={fetchNewTips} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Dicas
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiTips;
