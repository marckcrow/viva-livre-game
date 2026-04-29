import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Wine, Beer, Martini, Cigarette, TrendingDown, TrendingUp, Pencil, Trash2 } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocalConsumption, LocalConsumption } from "@/hooks/useLocalUser";
import EditConsumptionDialog from "@/components/EditConsumptionDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const History = () => {
  const navigate = useNavigate();
  const { records, deleteRecord } = useLocalConsumption();
  const [filteredRecords, setFilteredRecords] = useState<LocalConsumption[]>([]);
  const [filterType, setFilterType] = useState<"all" | "alcohol" | "tobacco">("all");
  const [dateRange, setDateRange] = useState<"all" | "week" | "month">("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [editing, setEditing] = useState<LocalConsumption | null>(null);
  const [deleting, setDeleting] = useState<LocalConsumption | null>(null);

  useEffect(() => {
    applyFilters();
  }, [records, filterType, dateRange, selectedDate]);

  const applyFilters = () => {
    let filtered = records;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((r) => r.consumptionType === filterType);
    }

    // Filter by date range
    const now = new Date();
    if (dateRange === "week") {
      const start = startOfWeek(now, { locale: ptBR });
      const end = endOfWeek(now, { locale: ptBR });
      filtered = filtered.filter((r) => {
        const date = new Date(r.consumptionDate);
        return date >= start && date <= end;
      });
    } else if (dateRange === "month") {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      filtered = filtered.filter((r) => {
        const date = new Date(r.consumptionDate);
        return date >= start && date <= end;
      });
    }

    // Filter by specific date
    if (selectedDate) {
      filtered = filtered.filter((r) => isSameDay(new Date(r.consumptionDate), selectedDate));
    }

    setFilteredRecords(filtered);
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteRecord(deleting.id);
    toast.success("Registro excluído", {
      description: "Sua contagem de dias livres foi recalculada automaticamente.",
    });
    setDeleting(null);
  };

  const getStats = () => {
    const alcoholRecords = filteredRecords.filter((r) => r.consumptionType === "alcohol");
    const tobaccoRecords = filteredRecords.filter((r) => r.consumptionType === "tobacco");

    const totalAlcohol = alcoholRecords.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const totalCigarettes = tobaccoRecords.reduce((sum, r) => sum + (r.cigaretteCount || 0), 0);

    // Calculate reduction trend (compare first half vs second half of filtered period)
    const midpoint = Math.floor(filteredRecords.length / 2);
    const firstHalf = filteredRecords.slice(midpoint);
    const secondHalf = filteredRecords.slice(0, midpoint);

    const firstHalfTotal = firstHalf.reduce((sum, r) => 
      sum + (r.consumptionType === "alcohol" ? (r.quantity || 0) : (r.cigaretteCount || 0)), 0
    );
    const secondHalfTotal = secondHalf.reduce((sum, r) => 
      sum + (r.consumptionType === "alcohol" ? (r.quantity || 0) : (r.cigaretteCount || 0)), 0
    );

    const reduction = firstHalfTotal > 0 
      ? ((firstHalfTotal - secondHalfTotal) / firstHalfTotal * 100).toFixed(1)
      : 0;

    return {
      totalRecords: filteredRecords.length,
      totalAlcohol,
      totalCigarettes,
      alcoholDays: new Set(alcoholRecords.map((r) => r.consumptionDate)).size,
      tobaccoDays: new Set(tobaccoRecords.map((r) => r.consumptionDate)).size,
      reductionPercent: Number(reduction),
      isIncreasing: secondHalfTotal > firstHalfTotal,
    };
  };

  const stats = getStats();

  const drinkIcons = {
    wine: Wine,
    beer: Beer,
    spirits: Martini,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Histórico Completo</h1>
              <p className="text-muted-foreground">Acompanhe sua jornada de perto</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Registros</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalRecords}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Bebidas Consumidas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalAlcohol.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">{stats.alcoholDays} dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cigarros Fumados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalCigarettes}</p>
              <p className="text-xs text-muted-foreground">{stats.tobaccoDays} dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tendência de Redução</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {stats.isIncreasing ? (
                  <TrendingUp className="h-5 w-5 text-destructive" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-success" />
                )}
                <p className="text-3xl font-bold">{Math.abs(stats.reductionPercent)}%</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.isIncreasing ? "Aumento" : "Redução"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Filters */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="alcohol">Álcool</SelectItem>
                    <SelectItem value="tobacco">Tabaco</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Período</label>
                <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Data específica</label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={ptBR}
                  className="rounded-md border"
                />
                {selectedDate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(undefined)}
                    className="w-full mt-2"
                  >
                    Limpar data
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Records List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Registros ({filteredRecords.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum registro encontrado com os filtros selecionados
                </p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredRecords.map((record) => {
                    const Icon = record.consumptionType === "alcohol"
                      ? drinkIcons[record.drinkType as keyof typeof drinkIcons]
                      : Cigarette;

                    return (
                      <div
                        key={record.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className={`p-2 rounded-full ${
                          record.consumptionType === "alcohol" 
                            ? "bg-primary/10 text-primary" 
                            : "bg-destructive/10 text-destructive"
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={record.consumptionType === "alcohol" ? "default" : "destructive"}>
                              {record.consumptionType === "alcohol" ? "Álcool" : "Tabaco"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(record.consumptionDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </span>
                          </div>
                          {record.consumptionType === "alcohol" ? (
                            <p className="text-sm">
                              <span className="font-medium">{record.quantity}</span>{" "}
                              {record.drinkType === "wine" && "taças de vinho"}
                              {record.drinkType === "beer" && "latas de cerveja"}
                              {record.drinkType === "spirits" && "doses de destilados"}
                            </p>
                          ) : (
                            <p className="text-sm">
                              <span className="font-medium">{record.cigaretteCount}</span> cigarros
                            </p>
                          )}
                          {record.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default History;
