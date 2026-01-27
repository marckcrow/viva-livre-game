import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, Zap, Heart, Brain, Wind, Activity } from "lucide-react";

interface RecoveryPhase {
  timeframe: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  daysRequired: number;
  benefits: string[];
}

const recoveryPhases: RecoveryPhase[] = [
  {
    timeframe: "20 minutos",
    title: "Primeiros Sinais",
    description: "Pressão arterial e batimentos cardíacos começam a normalizar",
    icon: <Heart className="w-5 h-5" />,
    daysRequired: 0,
    benefits: ["Pressão arterial diminui", "Batimentos cardíacos normalizam", "Temperatura das mãos e pés aumenta"],
  },
  {
    timeframe: "8-12 horas",
    title: "Oxigenação",
    description: "Níveis de monóxido de carbono caem, oxigênio aumenta",
    icon: <Wind className="w-5 h-5" />,
    daysRequired: 0.5,
    benefits: ["Níveis de CO normalizam", "Oxigênio no sangue aumenta", "Respiração melhora"],
  },
  {
    timeframe: "24-48 horas",
    title: "Desintoxicação Inicial",
    description: "Corpo começa a eliminar nicotina e toxinas do álcool",
    icon: <Zap className="w-5 h-5" />,
    daysRequired: 1,
    benefits: ["Risco de ataque cardíaco diminui", "Terminações nervosas regeneram", "Olfato e paladar melhoram"],
  },
  {
    timeframe: "3-7 dias",
    title: "Regeneração Celular",
    description: "Células começam a se reparar, energia aumenta",
    icon: <Activity className="w-5 h-5" />,
    daysRequired: 3,
    benefits: ["Bronquíolos relaxam", "Capacidade pulmonar aumenta", "Energia física melhora"],
  },
  {
    timeframe: "2-4 semanas",
    title: "Sistema Respiratório",
    description: "Pulmões limpam muco, circulação melhora significativamente",
    icon: <Wind className="w-5 h-5" />,
    daysRequired: 14,
    benefits: ["Função pulmonar aumenta 30%", "Tosse e falta de ar diminuem", "Circulação sanguínea melhora"],
  },
  {
    timeframe: "1-3 meses",
    title: "Sistema Cardiovascular",
    description: "Coração e vasos sanguíneos se fortalecem",
    icon: <Heart className="w-5 h-5" />,
    daysRequired: 30,
    benefits: ["Risco cardíaco reduz significativamente", "Pressão arterial estabiliza", "Energia para exercícios aumenta"],
  },
  {
    timeframe: "3-9 meses",
    title: "Sistema Imunológico",
    description: "Cílios pulmonares regeneram, imunidade fortalece",
    icon: <Zap className="w-5 h-5" />,
    daysRequired: 90,
    benefits: ["Menos infecções respiratórias", "Fígado regenera células", "Sistema imune fortalece"],
  },
  {
    timeframe: "1 ano",
    title: "Renovação Profunda",
    description: "Risco de doenças cardíacas cai pela metade",
    icon: <Heart className="w-5 h-5" />,
    daysRequired: 365,
    benefits: ["Risco cardíaco reduz 50%", "Fígado praticamente recuperado", "Qualidade de vida excelente"],
  },
  {
    timeframe: "5+ anos",
    title: "Renovação Completa",
    description: "Riscos de câncer e AVC reduzem ao nível de não-fumante",
    icon: <Brain className="w-5 h-5" />,
    daysRequired: 1825,
    benefits: ["Risco de câncer reduz 50%", "Risco de AVC igual a não-fumante", "Corpo completamente renovado"],
  },
];

interface RecoveryPhasesProps {
  daysClean: number;
}

const RecoveryPhases = ({ daysClean }: RecoveryPhasesProps) => {
  const completedPhases = recoveryPhases.filter(phase => daysClean >= phase.daysRequired);
  const currentPhase = recoveryPhases.find(phase => daysClean < phase.daysRequired);
  const nextPhaseIndex = recoveryPhases.findIndex(phase => daysClean < phase.daysRequired);
  
  // Calculate progress to next phase
  const progressToNext = currentPhase ? (() => {
    const prevDays = nextPhaseIndex > 0 ? recoveryPhases[nextPhaseIndex - 1].daysRequired : 0;
    const totalDays = currentPhase.daysRequired - prevDays;
    const currentProgress = daysClean - prevDays;
    return Math.min(100, (currentProgress / totalDays) * 100);
  })() : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          Fases de Recuperação do Organismo
        </CardTitle>
        <CardDescription>
          Acompanhe como seu corpo está se curando
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Progress */}
        {currentPhase && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Próxima fase: {currentPhase.title}</h3>
              <span className="text-xs text-muted-foreground">{currentPhase.timeframe}</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
            <p className="text-xs text-muted-foreground">{currentPhase.description}</p>
          </div>
        )}

        {/* Completed Phases */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Fases Conquistadas ({completedPhases.length}/{recoveryPhases.length})
          </h3>
          
          <div className="grid gap-3">
            {completedPhases.slice().reverse().map((phase, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20"
              >
                <div className="flex-shrink-0 mt-0.5 text-success">
                  {phase.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{phase.title}</p>
                    <span className="text-xs text-muted-foreground">{phase.timeframe}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {phase.benefits.map((benefit, i) => (
                      <span
                        key={i}
                        className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full"
                      >
                        ✓ {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Phases */}
        {nextPhaseIndex >= 0 && nextPhaseIndex < recoveryPhases.length - 1 && (
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Próximas Fases
            </h3>
            <div className="grid gap-2">
              {recoveryPhases.slice(nextPhaseIndex + 1, nextPhaseIndex + 3).map((phase, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 opacity-60"
                >
                  <div className="text-muted-foreground">{phase.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{phase.title}</p>
                    <p className="text-xs text-muted-foreground">{phase.timeframe}</p>
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

export default RecoveryPhases;
