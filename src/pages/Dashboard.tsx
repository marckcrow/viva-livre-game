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
import DailyMotivation from "@/components/DailyMotivation";
import RecoveryPhases from "@/components/RecoveryPhases";
import WellnessTips from "@/components/WellnessTips";
import GuidedPrayer from "@/components/GuidedPrayer";
import SavingsCalculator from "@/components/SavingsCalculator";
import RelapseTracker from "@/components/RelapseTracker";
import TestimonyAnalyzer from "@/components/TestimonyAnalyzer";
import AiTips from "@/components/AiTips";
import CrisisChatButton from "@/components/CrisisChatButton";
import DonationImpact from "@/components/DonationImpact";
import ManageSubscription from "@/components/ManageSubscription";
import { Heart, Sparkles, History as HistoryIcon } from "lucide-react";
import { useLocalConsumption, calculateDaysClean, useLocalProgress } from "@/hooks/useLocalUser";

const Dashboard = () => {
  const navigate = useNavigate();
  const { records, loadRecords } = useLocalConsumption();
  const { resetProgress } = useLocalProgress();
  const [daysClean, setDaysClean] = useState(0);

  useEffect(() => {
    const days = calculateDaysClean(records);
    setDaysClean(days);
  }, [records]);

  const handleRelapseLogged = () => {
    resetProgress();
    loadRecords();
    const days = calculateDaysClean(records);
    setDaysClean(days);
  };

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

        {/* Daily Motivation */}
        <DailyMotivation />

        {/* AI Tips */}
        <AiTips daysClean={daysClean} />

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

        {/* Relapse & Testimony with AI */}
        <div className="grid gap-8 md:grid-cols-2">
          <RelapseTracker daysClean={daysClean} onRelapseLogged={handleRelapseLogged} />
          <TestimonyAnalyzer daysClean={daysClean} />
        </div>

        {/* Savings Calculator */}
        <SavingsCalculator />

        <ProgressCharts />

        {/* Recovery Phases */}
        <RecoveryPhases daysClean={daysClean} />

        <div className="grid gap-8 md:grid-cols-2">
          <HealthBenefits daysClean={daysClean} />
          <AchievementsList daysClean={daysClean} />
        </div>

        {/* Donation Impact */}
        <DonationImpact />

        {/* Manage Subscription */}
        <ManageSubscription />

        {/* Guided Prayer */}
        <GuidedPrayer />

        {/* Wellness Tips */}
        <WellnessTips />

        <ReminderSettings />

        {/* Crisis Chat Button */}
        <CrisisChatButton />
      </main>
    </div>
  );
};

export default Dashboard;
