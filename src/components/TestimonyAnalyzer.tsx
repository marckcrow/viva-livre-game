import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageSquareText, Loader2, Sparkles, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TestimonyAnalyzerProps {
  daysClean: number;
}

const TestimonyAnalyzer = ({ daysClean }: TestimonyAnalyzerProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testimony, setTestimony] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [showAiResponse, setShowAiResponse] = useState(false);
  const { toast } = useToast();

  const prompts = [
    "Como você se sente hoje em sua jornada de recuperação?",
    "O que te motivou a buscar uma vida mais saudável?",
    "Quais foram suas maiores conquistas até agora?",
    "O que você aprendeu sobre si mesmo nesse processo?",
    "Como sua vida mudou desde que começou a reduzir o consumo?",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (testimony.trim().length < 20) {
      toast({
        title: "Depoimento muito curto",
        description: "Por favor, escreva um pouco mais para uma análise completa.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-analysis", {
        body: {
          type: "testimony",
          data: {
            testimony: testimony.trim(),
            daysClean,
            dependencyType: "álcool e/ou tabaco",
          },
        },
      });

      if (error) throw error;

      setAiResponse(data.response);
      setShowAiResponse(true);

      toast({
        title: "Análise concluída",
        description: "Veja as reflexões e sugestões personalizadas.",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível analisar seu depoimento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTestimony("");
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
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText className="w-5 h-5 text-primary" />
              Meu Depoimento
            </CardTitle>
            <CardDescription>
              Compartilhe sua jornada e receba análise personalizada com IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              <span>Escrever ajuda a processar emoções e celebrar conquistas</span>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-primary" />
            Compartilhe Seu Depoimento
          </DialogTitle>
          <DialogDescription>
            Escreva sobre sua jornada e a IA oferecerá reflexões e sugestões personalizadas.
          </DialogDescription>
        </DialogHeader>

        {!showAiResponse ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Sugestões para começar:</Label>
              <div className="flex flex-wrap gap-2">
                {prompts.map((prompt, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setTestimony(testimony + (testimony ? "\n\n" : "") + prompt + " ")}
                  >
                    {prompt.substring(0, 30)}...
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testimony">Seu depoimento</Label>
              <Textarea
                id="testimony"
                placeholder="Escreva livremente sobre sua jornada, seus sentimentos, desafios e conquistas..."
                value={testimony}
                onChange={(e) => setTestimony(e.target.value)}
                rows={8}
                className="resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {testimony.length}/2000 caracteres
              </p>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Dica:</strong> Quanto mais detalhes você compartilhar, mais personalizada será a análise. 
                Fale sobre seus gatilhos, conquistas, desafios e como você se sente.
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || testimony.trim().length < 20} className="flex-1">
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
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2 text-sm text-muted-foreground">Seu depoimento:</h4>
              <p className="text-sm italic">"{testimony}"</p>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Análise e Reflexões</h4>
              </div>
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                {aiResponse}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Fechar
              </Button>
              <Button onClick={() => {
                setShowAiResponse(false);
                setTestimony("");
              }} className="flex-1">
                Escrever Novo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TestimonyAnalyzer;
