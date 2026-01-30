import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalConsumption } from "@/hooks/useLocalUser";
import { TrendingDown, Wallet, PiggyBank, Target, Calendar } from "lucide-react";

const SavingsCalculator = () => {
  const { records } = useLocalConsumption();

  const stats = useMemo(() => {
    if (records.length === 0) {
      return {
        totalSpent: 0,
        avgWeeklySpent: 0,
        avgMonthlySpent: 0,
        potentialMonthlySavings: 0,
        daysTracked: 0,
        recordsWithCost: 0,
      };
    }

    const recordsWithCost = records.filter(r => r.cost && r.cost > 0);
    const totalSpent = recordsWithCost.reduce((sum, r) => sum + (r.cost || 0), 0);

    // Calculate days tracked
    const dates = records.map(r => new Date(r.consumptionDate).getTime());
    const firstDate = new Date(Math.min(...dates));
    const lastDate = new Date(Math.max(...dates));
    const daysTracked = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    // Calculate averages
    const weeksTracked = Math.max(1, daysTracked / 7);
    const monthsTracked = Math.max(1, daysTracked / 30);
    const avgWeeklySpent = totalSpent / weeksTracked;
    const avgMonthlySpent = totalSpent / monthsTracked;

    // Calculate potential savings (if reduced by 50%)
    const potentialMonthlySavings = avgMonthlySpent * 0.5;

    return {
      totalSpent,
      avgWeeklySpent,
      avgMonthlySpent,
      potentialMonthlySavings,
      daysTracked,
      recordsWithCost: recordsWithCost.length,
    };
  }, [records]);

  const weeklyStats = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = records.filter(r => {
      const date = new Date(r.consumptionDate);
      return date >= oneWeekAgo && date <= now;
    });

    const lastWeek = records.filter(r => {
      const date = new Date(r.consumptionDate);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    });

    const thisWeekCost = thisWeek.reduce((sum, r) => sum + (r.cost || 0), 0);
    const lastWeekCost = lastWeek.reduce((sum, r) => sum + (r.cost || 0), 0);

    const difference = lastWeekCost - thisWeekCost;
    const percentChange = lastWeekCost > 0 ? ((difference / lastWeekCost) * 100) : 0;

    return {
      thisWeekCost,
      lastWeekCost,
      difference,
      percentChange,
      saved: difference > 0,
    };
  }, [records]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-primary" />
            Economia Financeira
          </CardTitle>
          <CardDescription>
            Registre consumos com custo para ver sua economia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-4">
            Adicione o custo ao registrar consumos para acompanhar quanto você está economizando 💰
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-primary" />
          Economia Financeira
        </CardTitle>
        <CardDescription>
          Acompanhe seus gastos e veja quanto pode economizar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weekly Comparison */}
        {weeklyStats.lastWeekCost > 0 && (
          <div className={`p-4 rounded-lg ${weeklyStats.saved ? "bg-green-500/10 border border-green-500/20" : "bg-orange-500/10 border border-orange-500/20"}`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className={`w-5 h-5 ${weeklyStats.saved ? "text-green-500" : "text-orange-500"}`} />
              <span className="font-semibold">
                {weeklyStats.saved ? "Você economizou esta semana! 🎉" : "Gasto aumentou esta semana"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Semana passada</p>
                <p className="text-lg font-bold">{formatCurrency(weeklyStats.lastWeekCost)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Esta semana</p>
                <p className="text-lg font-bold">{formatCurrency(weeklyStats.thisWeekCost)}</p>
              </div>
            </div>
            {weeklyStats.saved && weeklyStats.difference > 0 && (
              <p className="mt-2 text-green-600 font-semibold">
                Economia: {formatCurrency(weeklyStats.difference)} ({weeklyStats.percentChange.toFixed(0)}% menos)
              </p>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <Wallet className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground">Total Gasto</p>
            <p className="text-xl font-bold">{formatCurrency(stats.totalSpent)}</p>
            <p className="text-xs text-muted-foreground">em {stats.daysTracked} dias</p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground">Média Semanal</p>
            <p className="text-xl font-bold">{formatCurrency(stats.avgWeeklySpent)}</p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground">Média Mensal</p>
            <p className="text-xl font-bold">{formatCurrency(stats.avgMonthlySpent)}</p>
          </div>

          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <PiggyBank className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-xs text-muted-foreground">Economia Potencial</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(stats.potentialMonthlySavings)}</p>
            <p className="text-xs text-muted-foreground">se reduzir 50%</p>
          </div>
        </div>

        {/* Motivation */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <p className="text-sm text-center">
            💡 <strong>Dica:</strong> Com {formatCurrency(stats.avgMonthlySpent)} por mês, em 1 ano você gastaria{" "}
            <strong>{formatCurrency(stats.avgMonthlySpent * 12)}</strong>. Imagine o que poderia fazer com esse dinheiro!
          </p>
        </div>

        {/* Suggestions based on spending */}
        {stats.avgMonthlySpent > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">O que você poderia fazer com essa economia:</p>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {stats.avgMonthlySpent >= 50 && (
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                  <span>🎬</span>
                  <span>Cinema com família todo mês</span>
                </div>
              )}
              {stats.avgMonthlySpent >= 100 && (
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                  <span>📚</span>
                  <span>Cursos online para desenvolvimento pessoal</span>
                </div>
              )}
              {stats.avgMonthlySpent >= 200 && (
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                  <span>💪</span>
                  <span>Academia ou atividades esportivas</span>
                </div>
              )}
              {stats.avgMonthlySpent >= 300 && (
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                  <span>✈️</span>
                  <span>Viagem de fim de semana a cada 2 meses</span>
                </div>
              )}
              {stats.avgMonthlySpent >= 500 && (
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                  <span>🏠</span>
                  <span>Investimento para o futuro da família</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavingsCalculator;
