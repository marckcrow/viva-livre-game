import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Server, Shield, Users, Megaphone, Code } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const CATEGORIES = [
  {
    icon: Server,
    label: "Infraestrutura e Servidores",
    percent: 35,
    description: "Hospedagem, banco de dados, serviços de IA e manutenção da plataforma.",
  },
  {
    icon: Code,
    label: "Desenvolvimento e Melhorias",
    percent: 30,
    description: "Novas funcionalidades, correção de bugs e melhorias de acessibilidade.",
  },
  {
    icon: Users,
    label: "Comunidade e Suporte",
    percent: 20,
    description: "Moderação, conteúdo educativo e apoio psicológico aos usuários.",
  },
  {
    icon: Megaphone,
    label: "Divulgação e Alcance",
    percent: 15,
    description: "Alcançar mais pessoas que precisam de ajuda na jornada de liberdade.",
  },
];

const Transparency = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl py-8 space-y-6">
        <Button onClick={() => navigate(-1)} variant="ghost">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center space-y-3">
          <Shield className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-3xl font-bold">Transparência</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Acreditamos que quem apoia merece saber exatamente como os recursos são utilizados.
          </p>
        </div>

        {/* Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Como usamos as doações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {CATEGORIES.map((cat) => (
              <div key={cat.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <cat.icon className="w-5 h-5 text-primary" />
                    <span className="font-medium text-sm">{cat.label}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{cat.percent}%</span>
                </div>
                <Progress value={cat.percent} className="h-2" />
                <p className="text-xs text-muted-foreground">{cat.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Commitment */}
        <Card className="border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Nossos compromissos
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>A plataforma sempre terá uma versão 100% gratuita</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Nenhum dado pessoal será vendido ou compartilhado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>100% das doações são reinvestidas na plataforma e na comunidade</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Publicaremos relatórios periódicos de impacto social</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Estamos no caminho para nos tornarmos uma ONG formalizada</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button onClick={() => navigate("/donate")} variant="success" size="lg">
            <Heart className="w-5 h-5 mr-2" />
            Fazer uma doação
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Transparency;
