import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Lock, CheckCircle2 } from "lucide-react";
import { useLocalAchievements } from "@/hooks/useLocalUser";
import { showNotification } from "@/utils/pushNotifications";
import { achievements, categoryLabels, type Achievement } from "@/data/achievements";

interface AchievementsListProps {
  daysClean: number;
}

const AchievementsList = ({ daysClean }: AchievementsListProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const { unlockedIds, unlockAchievement, isUnlocked } = useLocalAchievements();

  useEffect(() => {
    checkAndUnlockAchievements();
  }, [daysClean]);

  const checkAndUnlockAchievements = () => {
    for (const achievement of achievements) {
      if (daysClean >= achievement.daysRequired && !isUnlocked(achievement.id)) {
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

  const filterAchievements = (category: string): Achievement[] => {
    if (category === "all") return achievements;
    return achievements.filter((a) => a.category === category);
  };

  const filteredAchievements = filterAchievements(activeTab);
  const unlockedCount = achievements.filter((a) => isUnlocked(a.id)).length;

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🏆 Conquistas e Medalhas</span>
          <Badge variant="secondary">
            {unlockedCount}/{achievements.length}
          </Badge>
        </CardTitle>
        <CardDescription>Continue progredindo para desbloquear todas!</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 h-auto gap-1 mb-4">
            <TabsTrigger value="all" className="text-xs py-2">
              🎖️ Todas
            </TabsTrigger>
            {Object.entries(categoryLabels).map(([key, { emoji, label }]) => (
              <TabsTrigger key={key} value={key} className="text-xs py-2">
                {emoji} {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAchievements.map((achievement) => {
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
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Badge variant={unlocked ? "default" : "outline"}>
                        {achievement.daysRequired} dias
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {categoryLabels[achievement.category].emoji} {categoryLabels[achievement.category].label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AchievementsList;
