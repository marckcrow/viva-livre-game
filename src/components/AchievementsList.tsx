import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Lock, CheckCircle2 } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  days_required: number;
  icon: string;
}

interface AchievementsListProps {
  userId: string;
  daysClean: number;
}

const AchievementsList = ({ userId, daysClean }: AchievementsListProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

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

    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId);

    if (!userAchievementsError && userAchievements) {
      setUnlockedIds(new Set(userAchievements.map((ua) => ua.achievement_id)));
    }

    setAchievements(allAchievements || []);
    setLoading(false);
  };

  const checkAndUnlockAchievements = async () => {
    for (const achievement of achievements) {
      if (daysClean >= achievement.days_required && !unlockedIds.has(achievement.id)) {
        const { error } = await supabase.from("user_achievements").insert({
          user_id: userId,
          achievement_id: achievement.id,
        });

        if (!error) {
          setUnlockedIds((prev) => new Set([...prev, achievement.id]));
          toast.success(`🎉 Nova conquista desbloqueada: ${achievement.name}!`, {
            description: achievement.description,
            duration: 5000,
          });
        }
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
            const isUnlocked = unlockedIds.has(achievement.id);
            const isAvailable = daysClean >= achievement.days_required;

            return (
              <Card
                key={achievement.id}
                className={`transition-all duration-300 ${
                  isUnlocked
                    ? "bg-gradient-achievement shadow-achievement border-accent"
                    : "bg-muted/50 opacity-70"
                }`}
              >
                <CardContent className="pt-6 pb-4 text-center space-y-2">
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="font-semibold">{achievement.name}</h3>
                    {isUnlocked && <CheckCircle2 className="w-4 h-4 text-success" />}
                    {!isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <Badge variant={isUnlocked ? "default" : "outline"} className="mt-2">
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
