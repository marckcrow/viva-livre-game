import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Wine, Beer, Martini, Cigarette, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";

const alcoholSchema = z.object({
  quantity: z.number().positive().max(50),
});

const tobaccoSchema = z.object({
  cigarettes: z.number().int().min(1).max(100),
});

const ConsumptionLog = () => {
  const [open, setOpen] = useState(false);
  const [consumptionType, setConsumptionType] = useState<"alcohol" | "tobacco">("alcohol");
  const [drinkType, setDrinkType] = useState<"wine" | "beer" | "spirits">("wine");
  const [quantity, setQuantity] = useState("");
  const [cigarettes, setCigarettes] = useState("");
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

    // Validate inputs
    if (consumptionType === "alcohol") {
      const quantityNum = parseFloat(quantity);
      const validation = alcoholSchema.safeParse({ quantity: quantityNum });
      
      if (!validation.success) {
        toast({
          title: "Erro de validação",
          description: "Por favor, insira uma quantidade válida entre 0.5 e 50",
          variant: "destructive",
        });
        return;
      }
    } else {
      const cigarettesNum = parseInt(cigarettes);
      const validation = tobaccoSchema.safeParse({ cigarettes: cigarettesNum });
      
      if (!validation.success) {
        toast({
          title: "Erro de validação",
          description: "Por favor, insira um número válido de cigarros entre 1 e 100",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado");

      const insertData: any = {
        user_id: session.user.id,
        consumption_type: consumptionType,
        notes: notes.trim().substring(0, 500) || null,
      };

      if (consumptionType === "alcohol") {
        insertData.drink_type = drinkType;
        insertData.quantity = parseFloat(quantity);
      } else {
        insertData.cigarette_count = parseInt(cigarettes);
      }

      const { error } = await supabase
        .from("consumption_log")
        .insert(insertData);

      if (error) throw error;

      // Reset progress when consumption is logged
      const { error: progressError } = await supabase
        .from("progress_tracking")
        .update({
          days_clean: 0,
          start_date: new Date().toISOString(),
          last_check_in: new Date().toISOString(),
        })
        .eq("user_id", session.user.id);

      if (progressError) {
        console.error("Error resetting progress:", progressError);
      }

      toast({
        title: "Registro salvo",
        description: "Seu consumo foi registrado com sucesso",
      });

      setOpen(false);
      setQuantity("");
      setCigarettes("");
      setNotes("");
      
      // Reload the page to update progress
      window.location.reload();
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
              Registre álcool ou cigarros para acompanhar seu progresso
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
                <Cigarette className="w-8 h-8 mx-auto text-primary/70" />
                <p className="text-xs mt-1">Cigarro</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Consumo</DialogTitle>
          <DialogDescription>
            Registre o que você consumiu hoje
          </DialogDescription>
        </DialogHeader>
        <Tabs value={consumptionType} onValueChange={(v) => setConsumptionType(v as typeof consumptionType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="alcohol">🍷 Álcool</TabsTrigger>
            <TabsTrigger value="tobacco">
              <Cigarette className="w-4 h-4 mr-1" />
              Tabaco
            </TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <TabsContent value="alcohol" className="space-y-4">
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
                  max="50"
                  placeholder={`Ex: 1, 2, 2.5 ${drinkTypes[drinkType].unit}`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="tobacco" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cigarettes" className="flex items-center gap-2">
                  <Cigarette className="w-4 h-4" />
                  Quantidade de cigarros
                </Label>
                <Input
                  id="cigarettes"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Ex: 3, 5, 8 cigarros"
                  value={cigarettes}
                  onChange={(e) => setCigarettes(e.target.value)}
                  required={consumptionType === "tobacco"}
                />
              </div>
            </TabsContent>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Onde foi? Como se sentiu? Alguma observação..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ConsumptionLog;