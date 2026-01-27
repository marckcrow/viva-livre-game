import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DaysCounter from "@/components/DaysCounter";
import AchievementsList from "@/components/AchievementsList";
import ReductionPlan from "@/components/ReductionPlan";
import ConsumptionLog from "@/components/ConsumptionLog";
import HealthBenefits from "@/components/HealthBenefits";
import ReminderSettings from "@/components/ReminderSettings";
import ProgressCharts from "@/components/ProgressCharts";
import { Heart, Sparkles, History as HistoryIcon } from "lucide-react";
import { useLocalConsumption, calculateDaysClean } from "@/hooks/useLocalUser";

const Dashboard = () => {
  const navigate = useNavigate();
  const { records } = useLocalConsumption();
  const [daysClean, setDaysClean] = useState(0);

  useEffect(() => {
    const days = calculateDaysClean(records);
    setDaysClean(days);
  }, [records]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Viva+ Livre
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/history")} variant="ghost" size="sm">
              <HistoryIcon className="w-4 h-4 mr-2" />
              Histórico
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Olá, Campeão! 👋</h2>
          <p className="text-muted-foreground">Continue firme na sua jornada de liberdade</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2 lg:col-span-1">
            <DaysCounter daysClean={daysClean} />
          </div>
          <div className="md:col-span-2">
            <Button
              onClick={() => navigate("/donate")}
              variant="success"
              size="lg"
              className="w-full h-full min-h-[200px] flex-col gap-4 text-lg"
            >
              <Heart className="w-12 h-12" />
              <span>Apoie esta plataforma</span>
              <span className="text-sm font-normal opacity-90">
                Ajude a manter este espaço gratuito para todos
              </span>
            </Button>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <ReductionPlan />
          <ConsumptionLog />
        </div>

        <ProgressCharts />

        <div className="grid gap-8 md:grid-cols-2">
          <HealthBenefits daysClean={daysClean} />
          <AchievementsList daysClean={daysClean} />
        </div>

        <ReminderSettings />
      </main>
    </div>
  );
};

export default Dashboard;
