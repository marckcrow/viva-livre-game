import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Lock, CheckCircle2 } from "lucide-react";
import { useLocalAchievements } from "@/hooks/useLocalUser";
import { showNotification } from "@/utils/pushNotifications";

interface Achievement {
  id: string;
  name: string;
  description: string;
  days_required: number;
  icon: string;
}

interface AchievementsListProps {
  daysClean: number;
}

const AchievementsList = ({ daysClean }: AchievementsListProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { unlockedIds, unlockAchievement, isUnlocked } = useLocalAchievements();

  useEffect(() => {
    fetchAchievements();
  }, []);

  useEffect(() => {
    checkAndUnlockAchievements();
  }, [daysClean, achievements]);

  const fetchAchievements = async () => {
    const { data: allAchievements, error: achievementsError } = await supabase
      .from("achievements")
      .select("*")
      .order("days_required", { ascending: true });

    if (achievementsError) {
      toast.error("Erro ao carregar conquistas");
      return;
    }

    setAchievements(allAchievements || []);
    setLoading(false);
  };

  const checkAndUnlockAchievements = () => {
    for (const achievement of achievements) {
      if (daysClean >= achievement.days_required && !isUnlocked(achievement.id)) {
        unlockAchievement(achievement.id);
        toast.success(`🎉 Nova conquista desbloqueada: ${achievement.name}!`, {
          description: achievement.description,
          duration: 5000,
        });
        // Send push notification
        showNotification(`🎉 ${achievement.name}`, { body: achievement.description });
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conquistas</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Conquistas</span>
          <Badge variant="secondary">
            {unlockedIds.size}/{achievements.length}
          </Badge>
        </CardTitle>
        <CardDescription>Continue progredindo para desbloquear todas!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => {
            const unlocked = isUnlocked(achievement.id);

            return (
              <Card
                key={achievement.id}
                className={`transition-all duration-300 ${
                  unlocked
                    ? "bg-gradient-achievement shadow-achievement border-accent"
                    : "bg-muted/50 opacity-70"
                }`}
              >
                <CardContent className="pt-6 pb-4 text-center space-y-2">
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="font-semibold">{achievement.name}</h3>
                    {unlocked && <CheckCircle2 className="w-4 h-4 text-success" />}
                    {!unlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <Badge variant={unlocked ? "default" : "outline"} className="mt-2">
                    {achievement.days_required} dias
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementsList;
