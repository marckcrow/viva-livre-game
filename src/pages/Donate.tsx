import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Heart, Loader2, CheckCircle2, XCircle, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const SUGGESTED_AMOUNTS = [
  { value: 1000, label: "R$ 10" },
  { value: 2500, label: "R$ 25" },
  { value: 5000, label: "R$ 50" },
  { value: 10000, label: "R$ 100" },
];

const Donate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getAmountInCents = (): number | null => {
    if (selectedAmount) return selectedAmount;
    const parsed = parseFloat(customAmount.replace(",", "."));
    if (!isNaN(parsed) && parsed >= 5) return Math.round(parsed * 100);
    return null;
  };

  const handleDonate = async () => {
    const amount = getAmountInCents();
    if (!amount) {
      toast({ title: "Valor inválido", description: "O valor mínimo é R$ 5,00", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-donation", {
        body: { amount },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({ title: "Erro ao processar doação", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-glow text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
            <h2 className="text-2xl font-bold">Obrigado! 💚</h2>
            <p className="text-muted-foreground">
              Sua doação foi processada com sucesso. Você está ajudando pessoas a conquistarem sua liberdade.
            </p>
            <div className="flex gap-2 justify-center pt-4">
              <Button onClick={() => navigate("/dashboard")}>Voltar ao Dashboard</Button>
              <Button variant="outline" onClick={() => navigate("/transparencia")}>
                <Shield className="w-4 h-4 mr-2" />
                Ver transparência
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "canceled") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold">Doação cancelada</h2>
            <p className="text-muted-foreground">Sem problemas! Você pode doar quando quiser.</p>
            <Button onClick={() => navigate("/donate")}>Tentar novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card className="shadow-glow">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-gradient-achievement p-4 rounded-full shadow-achievement">
                <Heart className="w-12 h-12 text-accent-foreground" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Apoie o Viva+ Livre</CardTitle>
            <CardDescription className="text-base">
              Sua contribuição ajuda a manter esta plataforma gratuita e acessível para todos que buscam liberdade
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Suggested amounts */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Escolha um valor sugerido:</p>
              <div className="grid grid-cols-2 gap-3">
                {SUGGESTED_AMOUNTS.map((amt) => (
                  <Button
                    key={amt.value}
                    variant={selectedAmount === amt.value ? "default" : "outline"}
                    className="h-14 text-lg font-semibold"
                    onClick={() => {
                      setSelectedAmount(amt.value);
                      setCustomAmount("");
                    }}
                  >
                    {amt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Ou digite um valor livre (mín. R$ 5):</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-muted-foreground">R$</span>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  className="text-lg h-14"
                />
              </div>
            </div>

            {/* Donate button */}
            <Button
              onClick={handleDonate}
              disabled={isLoading || (!selectedAmount && !customAmount)}
              variant="success"
              size="lg"
              className="w-full h-14 text-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Heart className="w-5 h-5 mr-2" />
              )}
              {isLoading ? "Processando..." : "Doar agora"}
            </Button>

            {/* Info */}
            <div className="text-center space-y-2 text-sm text-muted-foreground">
              <p>💚 Qualquer valor faz a diferença</p>
              <p>🔒 Pagamento seguro via Stripe</p>
              <p>🙏 Muito obrigado pelo seu apoio!</p>
            </div>

            {/* Transparency link */}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/transparencia")}
            >
              <Shield className="w-4 h-4 mr-2" />
              Veja como usamos as doações
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Donate;
