import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";
import { useLocalConsumption, LocalConsumption } from "@/hooks/useLocalUser";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, eachWeekOfInterval, subWeeks, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart3, TrendingDown, Calendar } from "lucide-react";

interface ChartData {
  name: string;
  alcohol: number;
  tobacco: number;
  total: number;
  daysClean: number;
}

const ProgressCharts = () => {
  const { records } = useLocalConsumption();
  const [period, setPeriod] = useState<"week" | "month">("week");

  const weeklyData = useMemo(() => {
    const today = new Date();
    const days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayRecords = records.filter(
        (r) => r.consumptionDate === dayStr
      );

      const alcoholCount = dayRecords.filter((r) => r.consumptionType === "alcohol").length;
      const tobaccoCount = dayRecords
        .filter((r) => r.consumptionType === "tobacco")
        .reduce((sum, r) => sum + (r.cigaretteCount || 0), 0);

      return {
        name: format(day, "EEE", { locale: ptBR }),
        fullDate: format(day, "dd/MM", { locale: ptBR }),
        alcohol: alcoholCount,
        tobacco: tobaccoCount,
        total: alcoholCount + tobaccoCount,
        daysClean: alcoholCount === 0 && tobaccoCount === 0 ? 1 : 0,
      };
    });
  }, [records]);

  const monthlyData = useMemo(() => {
    const today = new Date();
    const weeks = eachWeekOfInterval(
      {
        start: subWeeks(today, 3),
        end: today,
      },
      { weekStartsOn: 0 }
    );

    return weeks.map((weekStart, index) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
      const weekRecords = records.filter((r) => {
        const recordDate = new Date(r.consumptionDate);
        return isWithinInterval(recordDate, { start: weekStart, end: weekEnd });
      });

      const alcoholCount = weekRecords.filter((r) => r.consumptionType === "alcohol").length;
      const tobaccoCount = weekRecords
        .filter((r) => r.consumptionType === "tobacco")
        .reduce((sum, r) => sum + (r.cigaretteCount || 0), 0);

      // Count clean days in the week
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd > today ? today : weekEnd });
      const cleanDays = daysInWeek.filter((day) => {
        const dayStr = format(day, "yyyy-MM-dd");
        return !records.some((r) => r.consumptionDate === dayStr);
      }).length;

      return {
        name: `Sem ${index + 1}`,
        fullDate: `${format(weekStart, "dd/MM")} - ${format(weekEnd, "dd/MM")}`,
        alcohol: alcoholCount,
        tobacco: tobaccoCount,
        total: alcoholCount + tobaccoCount,
        daysClean: cleanDays,
      };
    });
  }, [records]);

  const data = period === "week" ? weeklyData : monthlyData;

  const totalAlcohol = data.reduce((sum, d) => sum + d.alcohol, 0);
  const totalTobacco = data.reduce((sum, d) => sum + d.tobacco, 0);
  const totalCleanDays = data.reduce((sum, d) => sum + d.daysClean, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = data.find((d) => d.name === label);
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{item?.fullDate || label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Evolução do Progresso
        </CardTitle>
        <CardDescription>
          Acompanhe sua jornada ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Period Selector */}
        <Tabs value={period} onValueChange={(v) => setPeriod(v as "week" | "month")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="week" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Últimos 7 dias
            </TabsTrigger>
            <TabsTrigger value="month" className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Últimas 4 semanas
            </TabsTrigger>
          </TabsList>

          <TabsContent value={period} className="space-y-6 mt-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-secondary">{totalAlcohol}</p>
                <p className="text-xs text-muted-foreground">Bebidas</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-destructive">{totalTobacco}</p>
                <p className="text-xs text-muted-foreground">Cigarros</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">{totalCleanDays}</p>
                <p className="text-xs text-muted-foreground">Dias limpos</p>
              </div>
            </div>

            {/* Consumption Chart */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Consumo por período</h4>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ fontSize: 12 }}
                    />
                    <Bar 
                      dataKey="alcohol" 
                      name="Álcool" 
                      fill="hsl(200, 60%, 50%)" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="tobacco" 
                      name="Tabaco" 
                      fill="hsl(0, 70%, 55%)" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Clean Days Chart */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Dias limpos</h4>
              <div className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone"
                      dataKey="daysClean" 
                      name="Dias limpos" 
                      stroke="hsl(145, 65%, 45%)"
                      fill="hsl(145, 65%, 45%)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Motivational Message */}
            {records.length === 0 ? (
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <p className="text-sm text-primary">
                  🎉 Parabéns! Você não tem registros de consumo. Continue assim!
                </p>
              </div>
            ) : totalCleanDays > 0 && (
              <div className="bg-success/10 rounded-lg p-4 text-center">
                <p className="text-sm text-success">
                  ✨ Você teve {totalCleanDays} {totalCleanDays === 1 ? "dia" : "dias"} limpo{totalCleanDays === 1 ? "" : "s"} neste período!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProgressCharts;
