import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, Sunrise, Moon, Check, Trash2 } from "lucide-react";
import { useStoicJournal, JournalMood } from "@/hooks/useStoicJournal";
import { useToast } from "@/hooks/use-toast";

const MOODS: { key: JournalMood; label: string; emoji: string }[] = [
  { key: "sereno", label: "Sereno", emoji: "🌿" },
  { key: "grato", label: "Grato", emoji: "🙏" },
  { key: "firme", label: "Firme", emoji: "⚔️" },
  { key: "tenso", label: "Tenso", emoji: "🌊" },
  { key: "triste", label: "Triste", emoji: "🌧️" },
  { key: "irritado", label: "Irritado", emoji: "🔥" },
];

const StoicJournal = () => {
  const { entries, addEntry, deleteEntry } = useStoicJournal();
  const { toast } = useToast();
  const [mood, setMood] = useState<JournalMood | undefined>();

  // Morning fields
  const [control, setControl] = useState("");
  const [virtue, setVirtue] = useState("");
  const [temptation, setTemptation] = useState("");
  const [response, setResponse] = useState("");

  // Evening fields
  const [wins, setWins] = useState("");
  const [failures, setFailures] = useState("");
  const [learned, setLearned] = useState("");
  const [better, setBetter] = useState("");
  const [gratitude, setGratitude] = useState("");

  const saveMorning = () => {
    if (!control && !virtue && !temptation && !response) {
      toast({ title: "Escreva ao menos uma resposta", variant: "destructive" });
      return;
    }
    addEntry({ period: "morning", mood, control, virtue, temptation, response });
    setControl(""); setVirtue(""); setTemptation(""); setResponse(""); setMood(undefined);
    toast({ title: "Reflexão da manhã registrada", description: "Que o dia te encontre firme." });
  };

  const saveEvening = () => {
    if (!wins && !failures && !learned && !better && !gratitude) {
      toast({ title: "Escreva ao menos uma resposta", variant: "destructive" });
      return;
    }
    addEntry({ period: "evening", mood, wins, failures, learned, betterTomorrow: better, gratitude });
    setWins(""); setFailures(""); setLearned(""); setBetter(""); setGratitude(""); setMood(undefined);
    toast({ title: "Exame do dia registrado", description: "Descanse em paz com o que foi." });
  };

  const MoodPicker = () => (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">Como está seu estado interior?</Label>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMood(mood === m.key ? undefined : m.key)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              mood === m.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:bg-muted"
            }`}
          >
            <span className="mr-1">{m.emoji}</span> {m.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs uppercase tracking-widest">Diário Estoico</span>
        </div>
        <CardTitle className="font-display text-3xl">Exame de consciência</CardTitle>
        <CardDescription>
          Duas vezes por dia. De manhã, orienta o dia. À noite, examina-o com honestidade e sem culpa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="morning" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="morning" className="gap-2">
              <Sunrise className="w-4 h-4" /> Manhã
            </TabsTrigger>
            <TabsTrigger value="evening" className="gap-2">
              <Moon className="w-4 h-4" /> Noite
            </TabsTrigger>
          </TabsList>

          <TabsContent value="morning" className="space-y-4">
            <MoodPicker />
            <div className="space-y-1.5">
              <Label className="font-display text-lg">O que está sob meu controle hoje?</Label>
              <Textarea value={control} onChange={(e) => setControl(e.target.value)} rows={2} placeholder="Minhas ações, meus pensamentos, minhas respostas..." />
            </div>
            <div className="space-y-1.5">
              <Label className="font-display text-lg">Qual virtude quero praticar?</Label>
              <Textarea value={virtue} onChange={(e) => setVirtue(e.target.value)} rows={2} placeholder="Coragem, temperança, justiça, sabedoria..." />
            </div>
            <div className="space-y-1.5">
              <Label className="font-display text-lg">Que dificuldade posso encontrar?</Label>
              <Textarea value={temptation} onChange={(e) => setTemptation(e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label className="font-display text-lg">Como quero responder com sabedoria?</Label>
              <Textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={2} />
            </div>
            <Button onClick={saveMorning} className="w-full" size="lg">
              <Check className="w-4 h-4 mr-2" /> Registrar reflexão da manhã
            </Button>
          </TabsContent>

          <TabsContent value="evening" className="space-y-4">
            <MoodPicker />
            <div className="space-y-1.5">
              <Label className="font-display text-lg">Onde fui forte hoje?</Label>
              <Textarea value={wins} onChange={(e) => setWins(e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label className="font-display text-lg">Onde falhei? (sem culpa, apenas honestidade)</Label>
              <Textarea value={failures} onChange={(e) => setFailures(e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label className="font-display text-lg">O que aprendi?</Label>
              <Textarea value={learned} onChange={(e) => setLearned(e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label className="font-display text-lg">O que posso fazer melhor amanhã?</Label>
              <Textarea value={better} onChange={(e) => setBetter(e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label className="font-display text-lg">Pelo que sou grato?</Label>
              <Textarea value={gratitude} onChange={(e) => setGratitude(e.target.value)} rows={2} />
            </div>
            <Button onClick={saveEvening} className="w-full" size="lg" variant="secondary">
              <Check className="w-4 h-4 mr-2" /> Registrar exame da noite
            </Button>
          </TabsContent>
        </Tabs>

        {entries.length > 0 && (
          <div className="mt-8 pt-6 border-t space-y-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Últimas reflexões</p>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {entries.slice(0, 5).map((e) => {
                const moodMeta = MOODS.find((m) => m.key === e.mood);
                return (
                  <div key={e.id} className="p-3 rounded-md border bg-card/50 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        {e.period === "morning" ? <Sunrise className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                        <span>{new Date(e.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        {moodMeta && <span>· {moodMeta.emoji} {moodMeta.label}</span>}
                      </div>
                      <p className="text-sm text-foreground/85 line-clamp-2 font-display italic">
                        {e.control || e.virtue || e.wins || e.learned || e.gratitude || e.response || "—"}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteEntry(e.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StoicJournal;
