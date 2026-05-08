import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Flame, Trash2, Trophy, Target, Sparkles } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import { toast } from "@/hooks/use-toast";

const HabitsTracker = () => {
  const {
    habits,
    achievements,
    addHabit,
    removeHabit,
    toggleCheckin,
    isCheckedToday,
    getStreak,
    getWeekProgress,
  } = useHabits();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [weeklyGoal, setWeeklyGoal] = useState("5");

  const handleAdd = () => {
    if (!name.trim()) {
      toast({ title: "Dê um nome ao hábito", variant: "destructive" });
      return;
    }
    addHabit(name.trim(), emoji || "✨", parseInt(weeklyGoal, 10));
    setName("");
    setEmoji("✨");
    setWeeklyGoal("5");
    setOpen(false);
    toast({ title: "Hábito criado! 🌱", description: "Comece marcando o check-in de hoje." });
  };

  const handleToggle = (habitId: string, name: string) => {
    const wasChecked = isCheckedToday(habitId);
    toggleCheckin(habitId);
    if (!wasChecked) {
      toast({ title: `✅ ${name}`, description: "Mais um passo na sua jornada!" });
    }
  };

  const recentAchievements = [...achievements]
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, 4);

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Hábitos saudáveis
            </CardTitle>
            <CardDescription>
              Check-ins diários, metas semanais e conquistas automáticas
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" /> Novo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo hábito</DialogTitle>
                <DialogDescription>
                  Defina algo simples e mensurável para praticar nesta semana.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-[80px_1fr] gap-3">
                  <div>
                    <Label>Emoji</Label>
                    <Input
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      maxLength={2}
                      className="text-center text-xl"
                    />
                  </div>
                  <div>
                    <Label>Nome do hábito</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Ler 10 páginas"
                    />
                  </div>
                </div>
                <div>
                  <Label>Meta semanal</Label>
                  <Select value={weeklyGoal} onValueChange={setWeeklyGoal}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} {n === 1 ? "dia" : "dias"} por semana
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAdd} className="w-full">
                  Criar hábito
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {habits.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum hábito ainda. Crie o primeiro 🌱
          </p>
        )}

        {habits.map((h) => {
          const checked = isCheckedToday(h.id);
          const streak = getStreak(h.id);
          const week = getWeekProgress(h.id);
          const pct = Math.min(100, (week / h.weeklyGoal) * 100);
          const goalMet = week >= h.weeklyGoal;

          return (
            <div
              key={h.id}
              className="rounded-lg border bg-card p-4 space-y-3 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => handleToggle(h.id, h.name)}
                  className="h-5 w-5"
                />
                <span className="text-2xl">{h.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${checked ? "line-through text-muted-foreground" : ""}`}>
                    {h.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {streak > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Flame className="w-3 h-3 text-orange-500" />
                        {streak} {streak === 1 ? "dia" : "dias"}
                      </Badge>
                    )}
                    {goalMet && (
                      <Badge className="gap-1 bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/20">
                        <Target className="w-3 h-3" /> Meta semanal!
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeHabit(h.id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remover hábito"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Esta semana</span>
                  <span>
                    {week} / {h.weeklyGoal}
                  </span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            </div>
          );
        })}

        {recentAchievements.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-semibold">Conquistas recentes</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {recentAchievements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 rounded-md border bg-muted/30 p-2 text-sm"
                >
                  <span className="text-xl">{a.emoji}</span>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {a.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HabitsTracker;
