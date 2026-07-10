import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Target, Sun, Trash2, Sparkles, Compass, RefreshCw, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStoicDay, type Mood, type ControlLevel, type ControlType } from "@/hooks/useStoicDay";
import { getMissionOfDay, getReflectionOfDay, STOIC_MISSIONS } from "@/data/stoicMissions";
import { toast } from "@/hooks/use-toast";
import DisclaimerFooter from "@/components/jornada/DisclaimerFooter";

const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: "tranquilo", label: "Tranquilo", emoji: "🌊" },
  { value: "motivado", label: "Motivado", emoji: "⚡" },
  { value: "cansado", label: "Cansado", emoji: "😮‍💨" },
  { value: "preocupado", label: "Preocupado", emoji: "🌧️" },
  { value: "irritado", label: "Irritado", emoji: "🔥" },
  { value: "desanimado", label: "Desanimado", emoji: "🌫️" },
  { value: "esperancoso", label: "Esperançoso", emoji: "🌅" },
  { value: "sobrecarregado", label: "Sobrecarregado", emoji: "🎒" },
];

const CONTROL_LEVELS: { value: ControlLevel; label: string }[] = [
  { value: "sim", label: "Sim" },
  { value: "parcialmente", label: "Parcialmente" },
  { value: "nao", label: "Não" },
  { value: "ainda_nao_sei", label: "Ainda não sei" },
];

const VIRTUES = [
  "Sabedoria",
  "Coragem",
  "Justiça",
  "Temperança",
  "Paciência",
  "Disciplina",
  "Responsabilidade",
  "Serenidade",
  "Honestidade",
  "Generosidade",
];

const MeuDia = () => {
  const { user } = useAuth();
  const day = useStoicDay();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "caminhante";

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const reflection = useMemo(() => getReflectionOfDay(now), []);

  // Missão do dia
  const missionSeed = user?.id ?? "anon";
  const [missionIndex, setMissionIndex] = useState(0);
  const currentMission = useMemo(() => {
    if (day.mission.missionId) {
      const found = STOIC_MISSIONS.find((m) => m.id === day.mission.missionId);
      if (found) return found;
    }
    // rotação de missão alternativa quando o usuário troca
    return missionIndex === 0
      ? getMissionOfDay(now, missionSeed)
      : STOIC_MISSIONS[(STOIC_MISSIONS.findIndex((m) => m.id === getMissionOfDay(now, missionSeed).id) + missionIndex) % STOIC_MISSIONS.length];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionIndex, day.mission.missionId, missionSeed]);

  useEffect(() => {
    if (!day.mission.missionId && !day.mission.accepted) {
      // pré-selecionar a missão do dia sem marcar como aceita
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // círculo de controle
  const [newItem, setNewItem] = useState("");
  const [newType, setNewType] = useState<ControlType>("controllable");
  const [learning, setLearning] = useState(day.mission.learning ?? "");

  const controllables = day.controlItems.filter((c) => c.type === "controllable");
  const partials = day.controlItems.filter((c) => c.type === "partial");
  const uncontrollables = day.controlItems.filter((c) => c.type === "uncontrollable");

  const addItem = () => {
    if (!newItem.trim()) return;
    day.addControlItem(newItem.trim(), newType);
    setNewItem("");
  };

  const acceptMission = () => {
    day.setMission({ ...day.mission, missionId: currentMission.id, accepted: true });
    toast({ title: "Missão aceita.", description: "Um passo simples e realista." });
  };

  const swapMission = () => {
    setMissionIndex((i) => i + 1);
    day.setMission({ missionId: null, accepted: false, completed: false });
  };

  const completeMission = () => {
    day.setMission({ ...day.mission, missionId: currentMission.id, accepted: true, completed: true });
    toast({ title: "Missão concluída.", description: "Constância vale mais que perfeição." });
  };

  const saveLearning = () => {
    day.setMission({ ...day.mission, learning });
    toast({ title: "Aprendizado registrado." });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <section>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {dateStr}
        </p>
        <h2 className="font-display text-3xl md:text-4xl mt-1">
          Bom dia, {displayName}. O que depende de você hoje?
        </h2>
        <p className="mt-2 italic text-muted-foreground max-w-2xl">{reflection}</p>
      </section>

      {/* Bloco 1 — Check-in emocional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Heart className="w-5 h-5 text-accent" /> Como você está chegando a este dia?
          </CardTitle>
          <CardDescription>
            Sentimentos não são bons nem ruins. São informação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => day.setCheckin({ ...day.checkin, mood: m.value })}
                className={`rounded-md border p-3 text-sm flex flex-col items-center gap-1 transition-colors ${
                  day.checkin.mood === m.value
                    ? "border-primary bg-primary/10"
                    : "hover:bg-muted"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {m.emoji}
                </span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {day.checkin.mood && (
            <>
              <div>
                <Label className="text-sm">Intensidade: {day.checkin.intensity}</Label>
                <Slider
                  value={[day.checkin.intensity]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={([v]) =>
                    day.setCheckin({ ...day.checkin, intensity: v })
                  }
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 — leve</span>
                  <span>5 — muito forte</span>
                </div>
              </div>

              <div>
                <Label className="text-sm">
                  Esse sentimento está ligado a algo que você controla?
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CONTROL_LEVELS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() =>
                        day.setCheckin({ ...day.checkin, controlLevel: c.value })
                      }
                      className={`rounded-full border px-3 py-1 text-sm ${
                        day.checkin.controlLevel === c.value
                          ? "border-primary bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm">Uma anotação curta (opcional)</Label>
                <Textarea
                  rows={2}
                  value={day.checkin.notes ?? ""}
                  onChange={(e) =>
                    day.setCheckin({ ...day.checkin, notes: e.target.value })
                  }
                  placeholder="O que está por trás desse sentimento?"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bloco 2 — Círculo de controle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Compass className="w-5 h-5 text-accent" /> Círculo de controle
          </CardTitle>
          <CardDescription>
            Separe o que você pode agir daquilo que precisa acolher.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Ex.: reunião de amanhã, opinião de X, meu esforço no projeto…"
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
            <Select value={newType} onValueChange={(v) => setNewType(v as ControlType)}>
              <SelectTrigger className="sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="controllable">Sob meu controle</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="uncontrollable">Fora do meu controle</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addItem}>Adicionar</Button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {(
              [
                { key: "controllable", title: "Sob meu controle", items: controllables, tone: "bg-primary/10 border-primary/30" },
                { key: "partial", title: "Parcial", items: partials, tone: "bg-accent/10 border-accent/30" },
                { key: "uncontrollable", title: "Fora do meu controle", items: uncontrollables, tone: "bg-muted border" },
              ] as const
            ).map((col) => (
              <div key={col.key} className={`rounded-md border p-3 ${col.tone}`}>
                <p className="text-sm font-medium mb-2">{col.title}</p>
                {col.items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhum item ainda.</p>
                ) : (
                  <ul className="space-y-2">
                    {col.items.map((it) => (
                      <li key={it.id} className="flex items-start gap-2 text-sm">
                        <span className="flex-1">{it.description}</span>
                        <Select
                          value={it.type}
                          onValueChange={(v) => day.moveControlItem(it.id, v as ControlType)}
                        >
                          <SelectTrigger className="h-7 w-8 p-0 justify-center" aria-label="Mover">
                            <span className="sr-only">Mover</span>
                            <RefreshCw className="w-3 h-3" />
                          </SelectTrigger>
                          <SelectContent align="end">
                            <SelectItem value="controllable">Sob meu controle</SelectItem>
                            <SelectItem value="partial">Parcial</SelectItem>
                            <SelectItem value="uncontrollable">Fora do meu controle</SelectItem>
                          </SelectContent>
                        </Select>
                        <button
                          onClick={() => day.removeControlItem(it.id)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bloco 3 — Prioridades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Target className="w-5 h-5 text-accent" /> As três prioridades do dia
          </CardTitle>
          <CardDescription>
            Concluir o essencial já torna o dia significativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(["essential", "important", "desirable"] as const).map((lvl, idx) => {
            const labels = {
              essential: "1. Essencial",
              important: "2. Importante",
              desirable: "3. Desejável",
            } as const;
            const cur = day.priorities[lvl];
            return (
              <div key={lvl} className="flex items-center gap-3">
                <Checkbox
                  checked={cur.done}
                  onCheckedChange={(v) =>
                    day.setPriorities({
                      ...day.priorities,
                      [lvl]: { ...cur, done: !!v },
                    })
                  }
                />
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">{labels[lvl]}</Label>
                  <Input
                    value={cur.text}
                    onChange={(e) =>
                      day.setPriorities({
                        ...day.priorities,
                        [lvl]: { ...cur, text: e.target.value },
                      })
                    }
                    placeholder={
                      idx === 0
                        ? "O que precisa acontecer hoje?"
                        : idx === 1
                        ? "O que ajudaria muito se acontecesse?"
                        : "O que seria bom, mas pode esperar?"
                    }
                    className={cur.done ? "line-through text-muted-foreground" : ""}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Bloco 4 — Virtude do dia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Sparkles className="w-5 h-5 text-accent" /> Virtude do dia
          </CardTitle>
          <CardDescription>Escolha uma virtude e uma forma prática de praticar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {VIRTUES.map((v) => (
              <button
                key={v}
                onClick={() => day.setVirtue({ ...day.virtue, virtueName: v })}
                className={`rounded-full border px-3 py-1 text-sm ${
                  day.virtue.virtueName === v
                    ? "border-primary bg-primary/10"
                    : "hover:bg-muted"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          {day.virtue.virtueName && (
            <div>
              <Label className="text-sm">
                Como você pretende praticar {day.virtue.virtueName.toLowerCase()} hoje?
              </Label>
              <Textarea
                rows={2}
                value={day.virtue.intendedAction}
                onChange={(e) =>
                  day.setVirtue({ ...day.virtue, intendedAction: e.target.value })
                }
                placeholder="Uma ação concreta, pequena e possível."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bloco 5 — Missão diária */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Sun className="w-5 h-5 text-accent" /> Missão diária
          </CardTitle>
          <CardDescription>Simples, realizável em até quinze minutos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border bg-muted/30 p-4">
            <p className="font-display text-lg">{currentMission.text}</p>
            {currentMission.hint && (
              <p className="text-sm text-muted-foreground mt-1">{currentMission.hint}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {day.mission.accepted && (
                <Badge variant="secondary">Aceita</Badge>
              )}
              {day.mission.completed && (
                <Badge className="bg-primary text-primary-foreground">
                  <Check className="w-3 h-3 mr-1" /> Concluída
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={acceptMission} disabled={day.mission.accepted}>
              Aceitar missão
            </Button>
            <Button variant="outline" onClick={swapMission}>
              <RefreshCw className="w-4 h-4 mr-1" /> Trocar missão
            </Button>
            <Button variant="secondary" onClick={completeMission} disabled={day.mission.completed}>
              <Check className="w-4 h-4 mr-1" /> Concluir
            </Button>
          </div>

          <Separator />

          <div>
            <Label className="text-sm">Registrar aprendizado (opcional)</Label>
            <Textarea
              rows={2}
              value={learning}
              onChange={(e) => setLearning(e.target.value)}
              placeholder="O que essa missão mostrou para você?"
            />
            <Button size="sm" variant="ghost" onClick={saveLearning} className="mt-2">
              Salvar aprendizado
            </Button>
          </div>
        </CardContent>
      </Card>

      <DisclaimerFooter />
    </div>
  );
};

export default MeuDia;
