import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Brain, Wind, TrendingUp } from "lucide-react";

interface HealthBenefit {
  title: string;
  description: string;
  icon: React.ReactNode;
  daysRequired: number;
}

const healthBenefits: HealthBenefit[] = [
  {
    title: "Pressão Arterial Normalizada",
    description: "Sua pressão arterial começa a voltar ao normal.",
    icon: <Heart className="w-5 h-5" />,
    daysRequired: 1
  },
  {
    title: "Níveis de Oxigênio Melhorados",
    description: "Os níveis de oxigênio no sangue estão retornando ao normal.",
    icon: <Wind className="w-5 h-5" />,
    daysRequired: 1
  },
  {
    title: "Risco de Ataque Cardíaco Reduzido",
    description: "O risco de ataque cardíaco começa a diminuir significativamente.",
    icon: <Heart className="w-5 h-5" />,
    daysRequired: 2
  },
  {
    title: "Sentidos Melhorados",
    description: "Paladar e olfato começam a melhorar notavelmente.",
    icon: <Brain className="w-5 h-5" />,
    daysRequired: 3
  },
  {
    title: "Respiração Facilitada",
    description: "A função pulmonar começa a melhorar e respirar fica mais fácil.",
    icon: <Wind className="w-5 h-5" />,
    daysRequired: 7
  },
  {
    title: "Energia Aumentada",
    description: "Níveis de energia significativamente maiores ao longo do dia.",
    icon: <TrendingUp className="w-5 h-5" />,
    daysRequired: 15
  },
  {
    title: "Circulação Melhorada",
    description: "A circulação sanguínea melhora consideravelmente em todo o corpo.",
    icon: <Heart className="w-5 h-5" />,
    daysRequired: 30
  },
  {
    title: "Função Pulmonar Restaurada",
    description: "A função pulmonar pode aumentar em até 30%.",
    icon: <Wind className="w-5 h-5" />,
    daysRequired: 90
  },
  {
    title: "Risco de Doenças Reduzido",
    description: "Risco de doenças cardíacas reduzido pela metade.",
    icon: <Heart className="w-5 h-5" />,
    daysRequired: 365
  }
];

interface HealthBenefitsProps {
  daysClean: number;
}

const HealthBenefits = ({ daysClean }: HealthBenefitsProps) => {
  const unlockedBenefits = healthBenefits.filter(
    benefit => daysClean >= benefit.daysRequired
  );

  const nextBenefit = healthBenefits.find(
    benefit => daysClean < benefit.daysRequired
  );

  if (daysClean === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            Benefícios à Saúde
          </CardTitle>
          <CardDescription>
            Comece sua jornada e veja as melhorias na sua saúde!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" />
          Benefícios à Saúde
        </CardTitle>
        <CardDescription>
          Veja como seu corpo está se recuperando
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Unlocked Benefits */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-primary">Conquistados ✓</h3>
          {unlockedBenefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20"
            >
              <div className="flex-shrink-0 mt-0.5 text-primary">
                {benefit.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{benefit.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {benefit.description}
                </p>
                <p className="text-xs text-primary mt-1">
                  Dia {benefit.daysRequired}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Next Benefit */}
        {nextBenefit && (
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Próximo benefício
            </h3>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-muted">
              <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                {nextBenefit.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-muted-foreground">
                  {nextBenefit.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {nextBenefit.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Em {nextBenefit.daysRequired - daysClean} dias (Dia {nextBenefit.daysRequired})
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthBenefits;
