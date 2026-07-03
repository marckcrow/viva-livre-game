import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass, Quote as QuoteIcon } from "lucide-react";
import { getDailyMission, getDailyQuote } from "@/data/stoicContent";

const DailyStoicMission = () => {
  const mission = getDailyMission();
  const quote = getDailyQuote();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="parchment border-accent/30 shadow-soft overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent to-accent/40" />
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-accent">
            <Compass className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-medium">Missão de hoje</span>
          </div>
          <CardTitle className="font-display text-2xl leading-tight text-balance">
            {mission.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-foreground/85 leading-relaxed font-display text-lg italic">
            {mission.body}
          </p>
          <div className="pt-2 border-t border-border/60">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Prática</p>
            <p className="text-sm text-foreground/80">{mission.practice}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-hero text-primary-foreground shadow-soft overflow-hidden relative">
        <div className="absolute -top-8 -right-8 opacity-10">
          <QuoteIcon className="w-48 h-48" strokeWidth={1} />
        </div>
        <CardHeader className="pb-3 relative">
          <div className="flex items-center gap-2 text-primary-foreground/70">
            <QuoteIcon className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-medium">Palavra do dia</span>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <p className="font-display text-2xl leading-snug text-balance italic">
            "{quote.text}"
          </p>
          <p className="text-sm text-primary-foreground/70 uppercase tracking-widest">
            — {quote.author}
            {quote.source && <span className="normal-case tracking-normal opacity-70"> · {quote.source}</span>}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyStoicMission;
