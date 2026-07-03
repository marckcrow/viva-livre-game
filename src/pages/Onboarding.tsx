import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useOnboarding, MainGoal, ChallengeType, Tone } from "@/hooks/useOnboarding";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

const GOALS: { value: MainGoal; label: string }[] = [
  { value: "stop_addiction", label: "Parar um vício" },
  { value: "reduce_habit", label: "Reduzir um mau hábito" },
  { value: "improve_discipline", label: "Melhorar disciplina" },
  { value: "manage_emotions", label: "Controlar emoções" },
  { value: "spiritual_growth", label: "Buscar crescimento espiritual" },
  { value: "organize_life", label: "Organizar minha vida" },
  { value: "other", label: "Outro" },
];

const CHALLENGES: { value: ChallengeType; label: string }[] = [
  { value: "alcohol", label: "Álcool" },
  { value: "tobacco", label: "Cigarro" },
  { value: "drugs", label: "Drogas" },
  { value: "pornography", label: "Pornografia" },
  { value: "gambling", label: "Jogos" },
  { value: "shopping", label: "Compras" },
  { value: "food", label: "Comida" },
  { value: "social_media", label: "Redes sociais" },
  { value: "codependency", label: "Codependência" },
  { value: "anger", label: "Raiva" },
  { value: "anxiety", label: "Ansiedade" },
  { value: "procrastination", label: "Procrastinação" },
  { value: "no_purpose", label: "Falta de propósito" },
  { value: "other", label: "Outro" },
];

const TONES: { value: Tone; label: string; hint: string }[] = [
  { value: "gentle", label: "Suave e acolhedor", hint: "Palavras gentis, sem pressão." },
  { value: "direct", label: "Direto e disciplinador", hint: "Clareza e firmeza no acompanhamento." },
  { value: "philosophical", label: "Filosófico e reflexivo", hint: "Estoicismo, perguntas e reflexão." },
  { value: "spiritual", label: "Espiritual e esperançoso", hint: "Sentido superior, esperança e fé prática." },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { complete } = useOnboarding();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<MainGoal>();
  const [challenge, setChallenge] = useState<ChallengeType>();
  const [tone, setTone] = useState<Tone>("philosophical");
  const [trackSavings, setTrackSavings] = useState<boolean>(true);
  const [startChoice, setStartChoice] = useState<"today" | "custom">("today");
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const steps = 5;
  const progress = ((step + 1) / steps) * 100;

  const canNext = () => {
    if (step === 0) return !!goal;
    if (step === 1) return !!challenge;
    if (step === 2) return !!tone;
    if (step === 3) return trackSavings !== undefined;
    if (step === 4) return startChoice === "today" || !!customDate;
    return true;
  };

  const next = () => {
    if (step < steps - 1) return setStep(step + 1);
    complete({
      goal,
      challenge,
      tone,
      trackSavings,
      startDate: startChoice === "today" ? new Date().toISOString() : new Date(customDate).toISOString(),
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-accent">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest">Viva+ Livre</span>
          </div>
          <h1 className="font-display text-4xl">Vamos preparar sua jornada</h1>
          <p className="text-muted-foreground">Cinco perguntas simples para personalizar sua caminhada estoica.</p>
        </div>

        <Progress value={progress} className="h-1" />

        <Card className="shadow-soft">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-widest">Passo {step + 1} de {steps}</CardDescription>
            {step === 0 && <CardTitle className="font-display text-2xl">Qual é o seu principal objetivo?</CardTitle>}
            {step === 1 && <CardTitle className="font-display text-2xl">Qual desafio você enfrenta hoje?</CardTitle>}
            {step === 2 && <CardTitle className="font-display text-2xl">Qual tom de acompanhamento você prefere?</CardTitle>}
            {step === 3 && <CardTitle className="font-display text-2xl">Deseja acompanhar economia financeira?</CardTitle>}
            {step === 4 && <CardTitle className="font-display text-2xl">Quando quer marcar o início da jornada?</CardTitle>}
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 0 && (
              <RadioGroup value={goal} onValueChange={(v) => setGoal(v as MainGoal)} className="grid gap-2">
                {GOALS.map((g) => (
                  <Label key={g.value} htmlFor={`g-${g.value}`} className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors">
                    <RadioGroupItem id={`g-${g.value}`} value={g.value} />
                    <span className="font-display text-lg">{g.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            )}

            {step === 1 && (
              <RadioGroup value={challenge} onValueChange={(v) => setChallenge(v as ChallengeType)} className="grid gap-2 sm:grid-cols-2">
                {CHALLENGES.map((c) => (
                  <Label key={c.value} htmlFor={`c-${c.value}`} className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors">
                    <RadioGroupItem id={`c-${c.value}`} value={c.value} />
                    <span>{c.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            )}

            {step === 2 && (
              <RadioGroup value={tone} onValueChange={(v) => setTone(v as Tone)} className="grid gap-2">
                {TONES.map((t) => (
                  <Label key={t.value} htmlFor={`t-${t.value}`} className="flex items-start gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors">
                    <RadioGroupItem id={`t-${t.value}`} value={t.value} className="mt-1" />
                    <div>
                      <div className="font-display text-lg">{t.label}</div>
                      <div className="text-sm text-muted-foreground">{t.hint}</div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            )}

            {step === 3 && (
              <RadioGroup value={trackSavings ? "yes" : "no"} onValueChange={(v) => setTrackSavings(v === "yes")} className="grid gap-2">
                <Label htmlFor="s-yes" className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors">
                  <RadioGroupItem id="s-yes" value="yes" />
                  <span className="font-display text-lg">Sim, quero ver quanto economizo</span>
                </Label>
                <Label htmlFor="s-no" className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors">
                  <RadioGroupItem id="s-no" value="no" />
                  <span className="font-display text-lg">Não, prefiro não acompanhar</span>
                </Label>
              </RadioGroup>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <RadioGroup value={startChoice} onValueChange={(v) => setStartChoice(v as "today" | "custom")} className="grid gap-2">
                  <Label htmlFor="d-today" className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors">
                    <RadioGroupItem id="d-today" value="today" />
                    <span className="font-display text-lg">Começar hoje</span>
                  </Label>
                  <Label htmlFor="d-custom" className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors">
                    <RadioGroupItem id="d-custom" value="custom" />
                    <span className="font-display text-lg">Escolher uma data</span>
                  </Label>
                </RadioGroup>
                {startChoice === "custom" && (
                  <Input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
                )}
                <p className="text-xs text-muted-foreground italic border-l-2 border-accent pl-3">
                  Esta plataforma é educativa e de apoio. Não substitui acompanhamento médico, psicológico ou terapêutico. Em caso de crise, procure ajuda profissional.
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
              <Button onClick={next} disabled={!canNext()} size="lg">
                {step === steps - 1 ? "Começar jornada" : "Próximo"} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <button onClick={() => navigate("/dashboard")} className="text-xs text-muted-foreground hover:text-foreground underline">
            Pular por agora
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
