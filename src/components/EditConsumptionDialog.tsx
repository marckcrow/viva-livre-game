import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cigarette, DollarSign } from "lucide-react";
import { useLocalConsumption, LocalConsumption } from "@/hooks/useLocalUser";
import { toast } from "sonner";

const toLocalDatetimeInput = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const drinkLabels: Record<string, string> = {
  wine: "🍷 Vinho",
  beer: "🍺 Cerveja",
  spirits: "🥃 Destilados",
  bottle: "🍾 Garrafa",
  halfBottle: "🫙 Meiota",
};

interface Props {
  record: LocalConsumption;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditConsumptionDialog = ({ record, open, onOpenChange }: Props) => {
  const { updateRecord } = useLocalConsumption();
  const [drinkType, setDrinkType] = useState(record.drinkType ?? "wine");
  const [quantity, setQuantity] = useState(record.quantity?.toString() ?? "");
  const [cigarettes, setCigarettes] = useState(record.cigaretteCount?.toString() ?? "");
  const [cost, setCost] = useState(record.cost?.toString() ?? "");
  const [notes, setNotes] = useState(record.notes ?? "");
  const [consumedAt, setConsumedAt] = useState(toLocalDatetimeInput(new Date(record.consumptionDate)));

  useEffect(() => {
    if (open) {
      setDrinkType(record.drinkType ?? "wine");
      setQuantity(record.quantity?.toString() ?? "");
      setCigarettes(record.cigaretteCount?.toString() ?? "");
      setCost(record.cost?.toString() ?? "");
      setNotes(record.notes ?? "");
      setConsumedAt(toLocalDatetimeInput(new Date(record.consumptionDate)));
    }
  }, [open, record]);

  const handleSave = () => {
    const parsed = new Date(consumedAt);
    if (isNaN(parsed.getTime())) {
      toast.error("Data inválida");
      return;
    }
    if (parsed > new Date()) {
      toast.error("A data não pode estar no futuro");
      return;
    }

    if (record.consumptionType === "alcohol") {
      const q = parseFloat(quantity);
      if (!q || q <= 0 || q > 50) {
        toast.error("Quantidade inválida");
        return;
      }
      updateRecord(record.id, {
        drinkType: drinkType as LocalConsumption["drinkType"],
        quantity: q,
        cost: cost ? parseFloat(cost) : undefined,
        consumptionDate: parsed.toISOString(),
        notes: notes.trim().substring(0, 500) || undefined,
      });
    } else {
      const c = parseInt(cigarettes);
      if (!c || c < 1 || c > 100) {
        toast.error("Quantidade de cigarros inválida");
        return;
      }
      updateRecord(record.id, {
        cigaretteCount: c,
        cost: cost ? parseFloat(cost) : undefined,
        consumptionDate: parsed.toISOString(),
        notes: notes.trim().substring(0, 500) || undefined,
      });
    }

    toast.success("Registro atualizado", {
      description: "Sua contagem de dias e medalhas foram recalculadas.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Registro</DialogTitle>
          <DialogDescription>
            Ajuste os dados do consumo. A contagem de dias livres é recalculada automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {record.consumptionType === "alcohol" ? (
            <>
              <div className="space-y-2">
                <Label>Tipo de bebida</Label>
                <Tabs value={drinkType} onValueChange={(v) => setDrinkType(v as typeof drinkType)}>
                  <TabsList className="grid grid-cols-3 h-auto">
                    {Object.entries(drinkLabels).slice(0, 3).map(([k, v]) => (
                      <TabsTrigger key={k} value={k} className="text-xs py-2">{v}</TabsTrigger>
                    ))}
                  </TabsList>
                  <TabsList className="grid grid-cols-2 h-auto mt-1">
                    {Object.entries(drinkLabels).slice(3).map(([k, v]) => (
                      <TabsTrigger key={k} value={k} className="text-xs py-2">{v}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-qty">Quantidade</Label>
                <Input
                  id="edit-qty"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="50"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="edit-cig" className="flex items-center gap-2">
                <Cigarette className="w-4 h-4" /> Quantidade de cigarros
              </Label>
              <Input
                id="edit-cig"
                type="number"
                min="1"
                max="100"
                value={cigarettes}
                onChange={(e) => setCigarettes(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-when">Quando aconteceu?</Label>
            <Input
              id="edit-when"
              type="datetime-local"
              value={consumedAt}
              max={toLocalDatetimeInput(new Date())}
              onChange={(e) => setConsumedAt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-cost" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Custo (R$) - opcional
            </Label>
            <Input
              id="edit-cost"
              type="number"
              step="0.01"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Observações</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditConsumptionDialog;
