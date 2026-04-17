import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Heart, Loader2, Sparkles, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { shareToWhatsApp, formatAiResponseForShare } from "@/utils/shareToWhatsApp";
import { useLocalConsumption } from "@/hooks/useLocalUser";

interface RelapseTrackerProps {
  daysClean: number;
  onRelapseLogged: () => void;
}

const RelapseTracker = ({ daysClean, onRelapseLogged }: RelapseTrackerProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState("");
  const [feeling, setFeeling] = useState("");
  const [substance, setSubstance] = useState("");
  const [amount, setAmount] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [showAiResponse, setShowAiResponse] = useState(false);
  const { toast } = useToast();
  const { addRecord } = useLocalConsumption();

  const triggers = [
    { value: "stress", label: "Estresse" },
    { value: "social", label: "Pressão social" },
    { value: "emotional", label: "Problemas emocionais" },
    { value: "celebration", label: "Celebração" },
    { value: "boredom", label: "Tédio" },
    { value: "habit", label: "Hábito/Rotina" },
    { value: "craving", label: "Fissura forte" },
    { value: "other", label: "Outro" },
  ];

  const feelings = [
    { value: "anxious", label: "Ansioso(a)" },
    { value: "sad", label: "Triste" },
    { value: "angry", label: "Com raiva" },
    { value: "lonely", label: "Solitário(a)" },
    { value: "happy", label: "Feliz" },
    { value: "tired", label: "Cansado(a)" },
    { value: "frustrated", label: "Frustrado(a)" },
  ];

  const substances = [
    { value: "alcohol", label: "Álcool" },
    { value: "tobacco", label: "Tabaco" },
    { value: "both", label: "Ambos" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Register the relapse as a consumption event so days clean resets to 0
      const substanceMap: Record<string, "alcohol" | "tobacco"> = {
        alcohol: "alcohol",
        tobacco: "tobacco",
        both: "alcohol",
      };
      addRecord({
        consumptionType: substanceMap[substance] || "alcohol",
        consumptionDate: new Date().toISOString(),
        notes: `Recaída — Gatilho: ${triggers.find(t => t.value === trigger)?.label}. Sentimento: ${feelings.find(f => f.value === feeling)?.label}.${amount ? ` Quantidade: ${amount}` : ""}`,
        quantity: 1,
      });

      const { data, error } = await supabase.functions.invoke("ai-analysis", {
        body: {
          type: "relapse",
          data: {
            trigger: triggers.find(t => t.value === trigger)?.label || trigger,
            feeling: feelings.find(f => f.value === feeling)?.label || feeling,
            substance: substances.find(s => s.value === substance)?.label || substance,
            amount,
            daysCleanBefore: daysClean,
          },
        },
      });

      if (error) throw error;

      setAiResponse(data.response);
      setShowAiResponse(true);
      onRelapseLogged();

      toast({
        title: "Registro salvo",
        description: "Sua recaída foi registrada. Veja as orientações da IA.",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível processar sua solicitação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTrigger("");
    setFeeling("");
    setSubstance("");
    setAmount("");
    setAiResponse("");
    setShowAiResponse(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:border-destructive/50 transition-colors border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Registrar Recaída
            </CardTitle>
            <CardDescription>
              Teve uma recaída? Registre aqui e receba apoio personalizado com IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-primary" />
              <span>Recaídas fazem parte da jornada. O importante é recomeçar!</span>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Registrar Recaída
          </DialogTitle>
          <DialogDescription>
            Compartilhe o que aconteceu. A IA vai analisar e oferecer suporte personalizado.
          </DialogDescription>
        </DialogHeader>

        {!showAiResponse ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="substance">O que você consumiu?</Label>
              <Select value={substance} onValueChange={setSubstance} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {substances.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Quantidade (opcional)</Label>
              <Input
                id="amount"
                placeholder="Ex: 2 cervejas, 5 cigarros..."
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trigger">O que motivou a recaída?</Label>
              <Select value={trigger} onValueChange={setTrigger} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gatilho..." />
                </SelectTrigger>
                <SelectContent>
                  {triggers.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feeling">Como você estava se sentindo?</Label>
              <Select value={feeling} onValueChange={setFeeling} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {feelings.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !trigger || !feeling || !substance} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analisar com IA
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Orientações da IA</h4>
              </div>
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                {aiResponse}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => shareToWhatsApp(formatAiResponseForShare(aiResponse, "Apoio após recaída"))}
                title="Compartilhar no WhatsApp"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Fechar
              </Button>
              <Button onClick={() => setShowAiResponse(false)} className="flex-1">
                Registrar Outra
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RelapseTracker;
