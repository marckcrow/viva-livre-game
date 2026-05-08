import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // domingo
  return d;
}

function buildWeek(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function toKey(d: Date) {
  return d.toISOString().split("T")[0];
}

const HabitsCalendar = () => {
  const { habits, checkins } = useHabits();

  const today = new Date();
  const thisWeekStart = startOfWeek(today);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  const thisWeek = buildWeek(thisWeekStart);
  const lastWeek = buildWeek(lastWeekStart);

  const checkinsByDate = new Map<string, string[]>();
  checkins.forEach((c) => {
    const arr = checkinsByDate.get(c.date) ?? [];
    arr.push(c.habitId);
    checkinsByDate.set(c.date, arr);
  });

  const habitById = new Map(habits.map((h) => [h.id, h]));
  const todayKey = toKey(today);

  const renderWeek = (label: string, days: Date[]) => (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, idx) => {
          const key = toKey(d);
          const ids = checkinsByDate.get(key) ?? [];
          const isToday = key === todayKey;
          const isFuture = d.getTime() > today.getTime() && !isToday;
          const total = habits.length;
          const done = ids.length;
          const pct = total > 0 ? done / total : 0;

          return (
            <div
              key={key}
              className={cn(
                "rounded-lg border p-2 min-h-[88px] flex flex-col gap-1 transition-colors",
                isToday && "border-primary ring-1 ring-primary",
                isFuture && "opacity-40",
                !isFuture && done === 0 && "bg-muted/30",
                !isFuture && done > 0 && pct < 1 && "bg-primary/5",
                !isFuture && done > 0 && pct >= 1 && "bg-green-500/10 border-green-500/40"
              )}
              title={
                ids.length
                  ? ids
                      .map((id) => habitById.get(id))
                      .filter(Boolean)
                      .map((h) => `${h!.emoji} ${h!.name}`)
                      .join("\n")
                  : "Sem check-ins"
              }
            >
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] uppercase text-muted-foreground">
                  {DAY_LABELS[idx]}
                </span>
                <span className={cn("text-sm font-semibold", isToday && "text-primary")}>
                  {d.getDate()}
                </span>
              </div>
              <div className="flex flex-wrap gap-0.5 mt-auto">
                {ids.slice(0, 6).map((id, i) => {
                  const h = habitById.get(id);
                  if (!h) return null;
                  return (
                    <span key={i} className="text-sm leading-none">
                      {h.emoji}
                    </span>
                  );
                })}
                {ids.length > 6 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{ids.length - 6}
                  </span>
                )}
              </div>
              {total > 0 && !isFuture && (
                <span className="text-[10px] text-muted-foreground">
                  {done}/{total}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Calendário de hábitos
        </CardTitle>
        <CardDescription>
          Veja seus check-ins desta semana e da semana passada
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderWeek("Semana passada", lastWeek)}
        {renderWeek("Esta semana", thisWeek)}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-2 border-t">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-muted/60 border" /> Sem check-in
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-primary/20 border" /> Parcial
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500/30 border border-green-500/50" /> Tudo concluído
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitsCalendar;
