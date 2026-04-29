import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dumbbell, 
  Brain, 
  Sparkles, 
  Users, 
  BookOpen,
  Heart,
  Footprints,
  Wind,
  Smile,
  Home,
  HandHeart,
  GraduationCap
} from "lucide-react";

interface Tip {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface TipCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  emoji: string;
  tips: Tip[];
}

const tipCategories: TipCategory[] = [
  {
    id: "physical",
    label: "Físico",
    icon: <Dumbbell className="w-4 h-4" />,
    emoji: "💪",
    tips: [
      { title: "Caminhada Diária", description: "Comece com 15 minutos de caminhada. Aumenta endorfinas e reduz ansiedade.", icon: <Footprints className="w-4 h-4" /> },
      { title: "Alongamento Matinal", description: "5 minutos de alongamento ao acordar melhora circulação e disposição.", icon: <Wind className="w-4 h-4" /> },
      { title: "Hidratação", description: "Beba pelo menos 2 litros de água. Ajuda a eliminar toxinas e reduz a vontade.", icon: <Heart className="w-4 h-4" /> },
      { title: "Respiração Profunda", description: "Pratique 4-7-8: inspire 4s, segure 7s, expire 8s. Acalma o sistema nervoso.", icon: <Wind className="w-4 h-4" /> },
      { title: "Exercício Regular", description: "30 minutos de atividade 3x por semana libera endorfinas naturais.", icon: <Dumbbell className="w-4 h-4" /> },
      { title: "Sono de Qualidade", description: "Durma 7-8 horas. O corpo se recupera durante o sono.", icon: <Heart className="w-4 h-4" /> },
    ],
  },
  {
    id: "mental",
    label: "Mental",
    icon: <Brain className="w-4 h-4" />,
    emoji: "🧠",
    tips: [
      { title: "Meditação", description: "5-10 minutos diários de meditação reduzem estresse e ansiedade.", icon: <Brain className="w-4 h-4" /> },
      { title: "Diário de Gratidão", description: "Escreva 3 coisas pelas quais é grato cada dia. Muda o foco mental.", icon: <Smile className="w-4 h-4" /> },
      { title: "Terapia", description: "Considere buscar um profissional. Não há vergonha em pedir ajuda.", icon: <Heart className="w-4 h-4" /> },
      { title: "Mindfulness", description: "Pratique atenção plena: foque no presente, não no passado ou futuro.", icon: <Brain className="w-4 h-4" /> },
      { title: "Identifique Gatilhos", description: "Reconheça situações que provocam vontade e prepare estratégias.", icon: <Brain className="w-4 h-4" /> },
      { title: "Autocompaixão", description: "Seja gentil consigo mesmo. Recaídas fazem parte do processo.", icon: <Heart className="w-4 h-4" /> },
    ],
  },
  {
    id: "spiritual",
    label: "Espiritual",
    icon: <Sparkles className="w-4 h-4" />,
    emoji: "✨",
    tips: [
      { title: "Conexão com o Superior", description: "Reserve um momento do dia para conversar em silêncio com o Ser Superior em quem você acredita. Não importa o nome — importa a entrega. 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.' (Mateus 11,28)", icon: <Sparkles className="w-4 h-4" /> },
      { title: "Entrega e Confiança", description: "Você não precisa carregar tudo sozinho. Entregue suas dores a algo maior que você. 'Lança sobre o Senhor o teu cuidado, e Ele te susterá.' (Salmo 55,22)", icon: <Heart className="w-4 h-4" /> },
      { title: "Força na Fragilidade", description: "Reconhecer-se frágil é o primeiro passo da força verdadeira. 'A minha graça te basta, porque a força se aperfeiçoa na fraqueza.' (2 Coríntios 12,9)", icon: <HandHeart className="w-4 h-4" /> },
      { title: "Recomeçar Sempre", description: "Toda manhã é uma nova chance dada por Deus. Recaídas não definem quem você é. 'As misericórdias do Senhor se renovam a cada manhã.' (Lamentações 3,22-23)", icon: <Sparkles className="w-4 h-4" /> },
      { title: "Perdão a Si Mesmo", description: "Deus já te perdoou — falta você se perdoar. Solte a culpa, ela trava a recuperação. 'Se confessarmos os nossos pecados, Ele é fiel e justo para nos perdoar.' (1 João 1,9)", icon: <Heart className="w-4 h-4" /> },
      { title: "Oração Simples", description: "Não precisa de palavras bonitas. Diga apenas: 'Senhor, hoje me ajude a passar este dia em paz.' Pequenas orações sustentam grandes batalhas.", icon: <HandHeart className="w-4 h-4" /> },
      { title: "Silêncio e Escuta", description: "Reserve 5 minutos em silêncio. É no silêncio que ouvimos a voz suave do Espírito. 'Aquietai-vos e sabei que Eu sou Deus.' (Salmo 46,10)", icon: <Wind className="w-4 h-4" /> },
      { title: "Gratidão Diária", description: "Antes de dormir, agradeça por 3 coisas do seu dia. A gratidão abre o coração à graça. 'Em tudo dai graças.' (1 Tessalonicenses 5,18)", icon: <Smile className="w-4 h-4" /> },
      { title: "Esperança que Não Falha", description: "Mesmo nos dias difíceis, a esperança é âncora da alma. 'Posso todas as coisas Naquele que me fortalece.' (Filipenses 4,13)", icon: <Sparkles className="w-4 h-4" /> },
      { title: "Amor ao Próximo", description: "Ajudar outro em recuperação cura você também. 'Amai-vos uns aos outros como Eu vos amei.' (João 13,34)", icon: <Users className="w-4 h-4" /> },
      { title: "Natureza como Templo", description: "Caminhe ao ar livre e contemple a criação. Sentir-se parte de algo maior acalma a alma e renova o espírito.", icon: <Wind className="w-4 h-4" /> },
      { title: "Comunidade de Fé", description: "Grupos de oração, missas, cultos ou rodas de partilha oferecem acolhimento sem julgamento. Você não está sozinho nesta jornada.", icon: <Users className="w-4 h-4" /> },
    ],
  },
  {
    id: "social",
    label: "Social",
    icon: <Users className="w-4 h-4" />,
    emoji: "👥",
    tips: [
      { title: "Reconecte-se", description: "Retome contato com amigos e familiares que você se afastou.", icon: <Users className="w-4 h-4" /> },
      { title: "Grupos de Apoio", description: "AA, NA ou grupos online oferecem suporte de pessoas que entendem.", icon: <HandHeart className="w-4 h-4" /> },
      { title: "Novos Círculos", description: "Busque atividades sociais saudáveis: esportes, hobbies, voluntariado.", icon: <Users className="w-4 h-4" /> },
      { title: "Comunicação Aberta", description: "Seja honesto com pessoas próximas sobre sua jornada.", icon: <Heart className="w-4 h-4" /> },
      { title: "Evite Ambientes de Risco", description: "Nos primeiros meses, evite festas e locais associados ao consumo.", icon: <Home className="w-4 h-4" /> },
      { title: "Peça Ajuda", description: "Não tenha vergonha de pedir suporte quando precisar.", icon: <HandHeart className="w-4 h-4" /> },
    ],
  },
  {
    id: "family",
    label: "Familiar",
    icon: <Home className="w-4 h-4" />,
    emoji: "🏠",
    tips: [
      { title: "Diálogo Honesto", description: "Converse abertamente com a família sobre sua recuperação.", icon: <Heart className="w-4 h-4" /> },
      { title: "Peça Paciência", description: "A confiança leva tempo para ser reconstruída. Seja paciente.", icon: <Home className="w-4 h-4" /> },
      { title: "Tempo de Qualidade", description: "Crie momentos especiais com a família: refeições juntos, passeios.", icon: <Heart className="w-4 h-4" /> },
      { title: "Assuma Responsabilidades", description: "Mostre mudança através de ações, não apenas palavras.", icon: <Home className="w-4 h-4" /> },
      { title: "Terapia Familiar", description: "Considere terapia em família para curar relacionamentos.", icon: <Users className="w-4 h-4" /> },
      { title: "Celebre Junto", description: "Compartilhe suas conquistas e marcos com a família.", icon: <Sparkles className="w-4 h-4" /> },
    ],
  },
  {
    id: "intellectual",
    label: "Intelectual",
    icon: <BookOpen className="w-4 h-4" />,
    emoji: "📚",
    tips: [
      { title: "Leitura Diária", description: "Ler 20 minutos por dia estimula o cérebro e reduz estresse.", icon: <BookOpen className="w-4 h-4" /> },
      { title: "Aprenda Algo Novo", description: "Um novo idioma, instrumento ou habilidade mantém a mente ocupada.", icon: <GraduationCap className="w-4 h-4" /> },
      { title: "Podcasts e Documentários", description: "Conteúdo educativo estimula e inspira novas perspectivas.", icon: <Brain className="w-4 h-4" /> },
      { title: "Escreva", description: "Journaling, histórias ou poesia ajudam a processar emoções.", icon: <BookOpen className="w-4 h-4" /> },
      { title: "Jogos Mentais", description: "Palavras-cruzadas, sudoku ou xadrez exercitam o cérebro.", icon: <Brain className="w-4 h-4" /> },
      { title: "Cursos Online", description: "Plataformas gratuitas oferecem milhares de cursos. Invista em você!", icon: <GraduationCap className="w-4 h-4" /> },
    ],
  },
  {
    id: "cravings",
    label: "Saudade",
    icon: <Heart className="w-4 h-4" />,
    emoji: "💭",
    tips: [
      { title: "A Onda Passa", description: "A vontade é como uma onda: chega forte mas sempre passa em 15-20 min.", icon: <Wind className="w-4 h-4" /> },
      { title: "Distração Ativa", description: "Quando der vontade, faça algo: caminhe, ligue para alguém, tome água.", icon: <Footprints className="w-4 h-4" /> },
      { title: "Lembre o Porquê", description: "Escreva suas razões para parar e releia quando sentir saudade.", icon: <Heart className="w-4 h-4" /> },
      { title: "Substitua o Ritual", description: "Se fumava no café, mude o ritual: chá, suco ou local diferente.", icon: <Smile className="w-4 h-4" /> },
      { title: "Fale Sobre", description: "Contar para alguém que está com vontade ajuda a diminuí-la.", icon: <Users className="w-4 h-4" /> },
      { title: "Visualize o Futuro", description: "Imagine sua vida daqui 1 ano: mais saudável, livre, feliz.", icon: <Sparkles className="w-4 h-4" /> },
    ],
  },
];

const WellnessTips = () => {
  const [activeTab, setActiveTab] = useState("physical");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Dicas de Bem-Estar
        </CardTitle>
        <CardDescription>
          Cuidados para corpo, mente e espírito na sua jornada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 h-auto gap-1">
            {tipCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex flex-col py-2 px-1 text-xs"
              >
                <span className="text-lg">{category.emoji}</span>
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tipCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-4">
              <div className="grid gap-3 md:grid-cols-2">
                {category.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5 text-primary">
                      {tip.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{tip.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WellnessTips;
