import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, TrendingUp, CalendarHeart, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DonationStats {
  totalAmountCents: number;
  totalDonations: number;
  totalDonors: number;
  activeSubscriptions: number;
}

const DonationImpact = () => {
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (forceRefresh = false) => {
    try {
      const { data, error } = await supabase.functions.invoke("donation-stats", {
        body: forceRefresh ? { refresh: true } : undefined,
      });
      if (error) throw error;
      setStats(data);
      if (forceRefresh) {
        toast({ title: "Estatísticas atualizadas!" });
      }
    } catch (err) {
      console.error("Erro ao buscar estatísticas de doações:", err);
      if (forceRefresh) {
        toast({ title: "Erro ao atualizar", variant: "destructive" });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats(true);
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Impacto das Doações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || (stats.totalDonations === 0 && stats.activeSubscriptions === 0)) {
    return null;
  }

  const items = [
    {
      icon: TrendingUp,
      label: "Total arrecadado",
      value: formatCurrency(stats.totalAmountCents),
      color: "text-green-500",
    },
    {
      icon: Heart,
      label: "Doações recebidas",
      value: stats.totalDonations.toString(),
      color: "text-red-500",
    },
    {
      icon: Users,
      label: "Apoiadores",
      value: stats.totalDonors.toString(),
      color: "text-blue-500",
    },
    {
      icon: CalendarHeart,
      label: "Assinaturas ativas",
      value: stats.activeSubscriptions.toString(),
      color: "text-purple-500",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Impacto das Doações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-center"
            >
              <item.icon className={`w-6 h-6 ${item.color}`} />
              <span className="text-2xl font-bold">{item.value}</span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DonationImpact;
