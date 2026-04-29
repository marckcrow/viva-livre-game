import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wine, Beer, Martini, Cigarette, Plus, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { useLocalConsumption, useLocalProgress } from "@/hooks/useLocalUser";

const alcoholSchema = z.object({
  quantity: z.number().positive().max(50),
});

const tobaccoSchema = z.object({
  cigarettes: z.number().int().min(1).max(100),
});

// Helper: format Date to "YYYY-MM-DDTHH:mm" for datetime-local input (in local time)
const toLocalDatetimeInput = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const ConsumptionLog = () => {
  const [open, setOpen] = useState(false);
  const [consumptionType, setConsumptionType] = useState<"alcohol" | "tobacco">("alcohol");
  const [drinkType, setDrinkType] = useState<"wine" | "beer" | "spirits" | "bottle" | "halfBottle">("wine");
  const [quantity, setQuantity] = useState("");
  const [cigarettes, setCigarettes] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [consumedAt, setConsumedAt] = useState(toLocalDatetimeInput(new Date()));
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { addRecord } = useLocalConsumption();
  const { resetProgress } = useLocalProgress();

  // Refresh "now" each time the dialog opens
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setConsumedAt(toLocalDatetimeInput(new Date()));
  };

  const drinkTypes = {
    wine: { icon: Wine, label: "Vinho", unit: "taças", emoji: "🍷" },
    beer: { icon: Beer, label: "Cerveja", unit: "latas", emoji: "🍺" },
    spirits: { icon: Martini, label: "Destilados", unit: "doses", emoji: "🥃" },
    bottle: { icon: Wine, label: "Garrafa", unit: "garrafas", emoji: "🍾" },
    halfBottle: { icon: Beer, label: "Meiota", unit: "meiotas", emoji: "🫙" },
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
      // Parse the chosen date/time. If invalid or in the future, fall back to now.
      const parsed = new Date(consumedAt);
      const now = new Date();
      const when = isNaN(parsed.getTime()) || parsed > now ? now : parsed;
      const isoWhen = when.toISOString();
      const costValue = cost ? parseFloat(cost) : undefined;

      if (consumptionType === "alcohol") {
        addRecord({
          consumptionType: "alcohol",
          drinkType,
          quantity: parseFloat(quantity),
          cost: costValue,
          consumptionDate: isoWhen,
          notes: notes.trim().substring(0, 500) || undefined,
        });
      } else {
        addRecord({
          consumptionType: "tobacco",
          cigaretteCount: parseInt(cigarettes),
          cost: costValue,
          consumptionDate: isoWhen,
          notes: notes.trim().substring(0, 500) || undefined,
        });
      }

      // Reset progress when consumption is logged
      resetProgress();

      toast({
        title: "Registro salvo",
        description: "Seu consumo foi registrado com sucesso",
      });

      setOpen(false);
      setQuantity("");
      setCigarettes("");
      setCost("");
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            <div className="flex justify-around flex-wrap gap-2">
              <div className="text-center">
                <span className="text-2xl">🍷</span>
                <p className="text-xs mt-1">Vinho</p>
              </div>
              <div className="text-center">
                <span className="text-2xl">🍺</span>
                <p className="text-xs mt-1">Cerveja</p>
              </div>
              <div className="text-center">
                <span className="text-2xl">🍾</span>
                <p className="text-xs mt-1">Garrafa</p>
              </div>
              <div className="text-center">
                <span className="text-2xl">🫙</span>
                <p className="text-xs mt-1">Meiota</p>
              </div>
              <div className="text-center">
                <Cigarette className="w-6 h-6 mx-auto text-primary/70" />
                <p className="text-xs mt-1">Cigarro</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                  {Object.entries(drinkTypes).map(([type, { label, emoji }]) => (
                    <Button
                      key={type}
                      type="button"
                      variant={drinkType === type ? "default" : "outline"}
                      className="flex flex-col h-auto py-3"
                      onClick={() => setDrinkType(type as typeof drinkType)}
                    >
                      <span className="text-xl mb-1">{emoji}</span>
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
              <Label htmlFor="cost" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Custo (R$) - opcional
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 15.50"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>

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
