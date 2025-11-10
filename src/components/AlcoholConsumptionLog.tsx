import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Wine, Beer, Martini, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const AlcoholConsumptionLog = () => {
  const [open, setOpen] = useState(false);
  const [drinkType, setDrinkType] = useState<"wine" | "beer" | "spirits">("wine");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const drinkTypes = {
    wine: { icon: Wine, label: "Vinho", unit: "taças" },
    beer: { icon: Beer, label: "Cerveja", unit: "latas" },
    spirits: { icon: Martini, label: "Destilados", unit: "doses" },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || parseFloat(quantity) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, informe uma quantidade válida",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("alcohol_consumption_log")
        .insert({
          user_id: session.user.id,
          drink_type: drinkType,
          quantity: parseFloat(quantity),
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: "Registro salvo",
        description: "Seu consumo foi registrado com sucesso",
      });

      setOpen(false);
      setQuantity("");
      setNotes("");
    } catch (error: any) {
      toast({
        title: "Erro ao registrar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Registrar Consumo
            </CardTitle>
            <CardDescription>
              Registre quando você consumir bebidas alcoólicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-around">
              <div className="text-center">
                <Wine className="w-8 h-8 mx-auto text-primary/70" />
                <p className="text-xs mt-1">Vinho</p>
              </div>
              <div className="text-center">
                <Beer className="w-8 h-8 mx-auto text-primary/70" />
                <p className="text-xs mt-1">Cerveja</p>
              </div>
              <div className="text-center">
                <Martini className="w-8 h-8 mx-auto text-primary/70" />
                <p className="text-xs mt-1">Destilados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Consumo de Álcool</DialogTitle>
          <DialogDescription>
            Registre o que você bebeu hoje para acompanhar seu progresso
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Bebida</Label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(drinkTypes).map(([type, { icon: Icon, label }]) => (
                <Button
                  key={type}
                  type="button"
                  variant={drinkType === type ? "default" : "outline"}
                  className="flex flex-col h-auto py-4"
                  onClick={() => setDrinkType(type as typeof drinkType)}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantidade ({drinkTypes[drinkType].unit})
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.5"
              min="0.5"
              placeholder={`Ex: 1, 2, 2.5 ${drinkTypes[drinkType].unit}`}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Onde foi? Como se sentiu? Alguma observação..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AlcoholConsumptionLog;