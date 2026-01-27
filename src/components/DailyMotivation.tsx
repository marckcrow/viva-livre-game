import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Heart, Sparkles, Brain, Star } from "lucide-react";

interface MotivationalContent {
  type: "motivation" | "tip" | "curiosity" | "encouragement";
  icon: React.ReactNode;
  title: string;
  message: string;
}

const motivationalContent: MotivationalContent[] = [
  // Mensagens de ânimo
  { type: "encouragement", icon: <Heart className="w-5 h-5" />, title: "Você é forte!", message: "Cada dia sem consumir é uma vitória. Você está construindo uma nova versão de si mesmo!" },
  { type: "encouragement", icon: <Sparkles className="w-5 h-5" />, title: "Continue assim!", message: "Sua determinação é admirável. O caminho pode ser difícil, mas você está no controle!" },
  { type: "encouragement", icon: <Star className="w-5 h-5" />, title: "Orgulhe-se!", message: "Nem todo mundo tem a coragem de mudar. Você está fazendo algo extraordinário por sua saúde!" },
  { type: "encouragement", icon: <Heart className="w-5 h-5" />, title: "Você merece!", message: "Merece uma vida plena e saudável. Cada pequeno passo conta nessa jornada!" },
  { type: "encouragement", icon: <Sparkles className="w-5 h-5" />, title: "Força, guerreiro!", message: "Os momentos difíceis passam, mas a força que você está construindo fica para sempre!" },
  
  // Dicas práticas
  { type: "tip", icon: <Lightbulb className="w-5 h-5" />, title: "Dica do dia", message: "Quando sentir vontade, beba um copo grande de água gelada. A sensação ajuda a distrair a mente!" },
  { type: "tip", icon: <Lightbulb className="w-5 h-5" />, title: "Respire fundo", message: "Pratique 5 respirações profundas quando sentir ansiedade. Inspire 4 segundos, segure 4, expire 6." },
  { type: "tip", icon: <Lightbulb className="w-5 h-5" />, title: "Mude o ambiente", message: "Evite locais e situações que você associa ao consumo, pelo menos nos primeiros meses." },
  { type: "tip", icon: <Lightbulb className="w-5 h-5" />, title: "Tenha um aliado", message: "Conte para alguém de confiança sobre sua jornada. O apoio de amigos e família é fundamental!" },
  { type: "tip", icon: <Lightbulb className="w-5 h-5" />, title: "Celebre pequenas vitórias", message: "Cada dia, cada hora sem consumir é uma conquista. Permita-se comemorar!" },
  { type: "tip", icon: <Lightbulb className="w-5 h-5" />, title: "Substitua o hábito", message: "Quando der vontade, faça algo prazeroso: caminhe, ouça música, ligue para alguém querido." },
  
  // Curiosidades sobre saúde
  { type: "curiosity", icon: <Brain className="w-5 h-5" />, title: "Você sabia?", message: "Em apenas 20 minutos sem fumar, sua pressão arterial e frequência cardíaca já começam a normalizar!" },
  { type: "curiosity", icon: <Brain className="w-5 h-5" />, title: "Curiosidade", message: "Após 48 horas sem álcool, seu fígado já começa a se regenerar e eliminar toxinas acumuladas!" },
  { type: "curiosity", icon: <Brain className="w-5 h-5" />, title: "Fato interessante", message: "O cérebro leva cerca de 90 dias para 'reprogramar' os circuitos de recompensa após parar de fumar." },
  { type: "curiosity", icon: <Brain className="w-5 h-5" />, title: "Você sabia?", message: "Pessoas que param de fumar ganham em média 7 anos de vida comparado a quem continua." },
  { type: "curiosity", icon: <Brain className="w-5 h-5" />, title: "Impressionante!", message: "Após 1 ano sem álcool, o risco de doenças cardíacas cai pela metade!" },
  { type: "curiosity", icon: <Brain className="w-5 h-5" />, title: "Sabia disso?", message: "O olfato e paladar melhoram significativamente já nas primeiras 48 horas sem cigarro!" },
  
  // Motivação para continuar
  { type: "motivation", icon: <Sparkles className="w-5 h-5" />, title: "Reflexão", message: "O prazer momentâneo não vale a dor duradoura. Escolha a liberdade, escolha você!" },
  { type: "motivation", icon: <Sparkles className="w-5 h-5" />, title: "Pense nisso", message: "Cada vez que você resiste, está treinando sua força de vontade. Isso vale para toda a vida!" },
  { type: "motivation", icon: <Sparkles className="w-5 h-5" />, title: "Lembre-se", message: "Você não está privando a si mesmo de nada. Está se libertando de algo que te prendia!" },
  { type: "motivation", icon: <Sparkles className="w-5 h-5" />, title: "Motivação", message: "A mudança começa quando a dor de ficar igual é maior que a dor de mudar. Você já começou!" },
];

const LOCAL_LAST_MOTIVATION_KEY = "vivaLivre_lastMotivation";

const DailyMotivation = () => {
  const [content, setContent] = useState<MotivationalContent | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(LOCAL_LAST_MOTIVATION_KEY);
    
    let storedData = stored ? JSON.parse(stored) : null;
    
    // Check if we need a new message (new day or first visit)
    if (!storedData || storedData.date !== today) {
      // Get a random message
      const randomIndex = Math.floor(Math.random() * motivationalContent.length);
      const newContent = motivationalContent[randomIndex];
      
      storedData = {
        date: today,
        contentIndex: randomIndex,
      };
      
      localStorage.setItem(LOCAL_LAST_MOTIVATION_KEY, JSON.stringify(storedData));
      setContent(newContent);
      setIsNew(true);
    } else {
      setContent(motivationalContent[storedData.contentIndex]);
      setIsNew(false);
    }
  }, []);

  if (!content) return null;

  const typeStyles = {
    motivation: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    tip: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    curiosity: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    encouragement: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  };

  const typeIconColors = {
    motivation: "text-purple-500",
    tip: "text-blue-500",
    curiosity: "text-amber-500",
    encouragement: "text-green-500",
  };

  return (
    <Card className={`bg-gradient-to-r ${typeStyles[content.type]} border ${isNew ? "animate-fade-in" : ""}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2 rounded-full bg-background/50 ${typeIconColors[content.type]}`}>
            {content.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              {content.title}
              {isNew && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  Novo!
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {content.message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyMotivation;
