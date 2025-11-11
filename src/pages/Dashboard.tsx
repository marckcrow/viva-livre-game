import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DaysCounter from "@/components/DaysCounter";
import AchievementsList from "@/components/AchievementsList";
import ReductionPlan from "@/components/ReductionPlan";
import ConsumptionLog from "@/components/ConsumptionLog";
import { Heart, LogOut, Sparkles } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysClean, setDaysClean] = useState(0);
  const [progressId, setProgressId] = useState<string | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session?.user) {
      fetchOrCreateProgress();
    }
  }, [session]);

  const fetchOrCreateProgress = async () => {
    if (!session?.user) return;

    const { data: progress, error } = await supabase
      .from("progress_tracking")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (error && error.code === "PGRST116") {
      const { data: newProgress, error: createError } = await supabase
        .from("progress_tracking")
        .insert({
          user_id: session.user.id,
          days_clean: 0,
        })
        .select()
        .single();

      if (!createError && newProgress) {
        setProgressId(newProgress.id);
        setDaysClean(0);
      }
    } else if (progress) {
      setProgressId(progress.id);
      // Use days_clean from database (updated daily by cron)
      setDaysClean(progress.days_clean);
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      toast.success("Até logo!");
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

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
          <Button onClick={handleSignOut} variant="ghost" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Olá, {session?.user?.user_metadata?.full_name || "Campeão"}! 👋</h2>
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

        {session?.user && (
          <AchievementsList userId={session.user.id} daysClean={daysClean} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
