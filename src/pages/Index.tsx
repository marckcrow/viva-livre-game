import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, Trophy, Heart, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center space-y-8">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-hero p-6 rounded-full shadow-glow animate-pulse">
            <Sparkles className="w-16 h-16 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent">
          Viva+ Livre
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          Sua jornada de liberdade começa aqui. Uma plataforma acolhedora e gamificada para te apoiar na superação de vícios.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button onClick={() => navigate("/dashboard")} size="lg" variant="hero" className="text-lg">
            Começar Agora
          </Button>
          <Button onClick={() => navigate("/donate")} size="lg" variant="success" className="text-lg">
            <Heart className="w-5 h-5 mr-2" />
            Apoiar Projeto
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Como funciona</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-soft hover:shadow-glow transition-all duration-300">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="bg-gradient-hero p-4 rounded-full inline-block shadow-soft">
                <Target className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Acompanhe Progresso</h3>
              <p className="text-sm text-muted-foreground">
                Veja seus dias limpos crescerem e celebre cada vitória
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-glow transition-all duration-300">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="bg-gradient-achievement p-4 rounded-full inline-block shadow-achievement">
                <Trophy className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Conquistas</h3>
              <p className="text-sm text-muted-foreground">
                Desbloqueie medalhas conforme progride na jornada
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-glow transition-all duration-300">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="bg-secondary p-4 rounded-full inline-block shadow-soft">
                <Users className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Comunidade</h3>
              <p className="text-sm text-muted-foreground">
                Compartilhe histórias e inspire outras pessoas
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-glow transition-all duration-300">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="bg-success p-4 rounded-full inline-block shadow-soft">
                <Heart className="w-8 h-8 text-success-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Gratuito</h3>
              <p className="text-sm text-muted-foreground">
                100% gratuito, mantido por doações da comunidade
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="bg-gradient-card shadow-glow border-primary/20 max-w-2xl mx-auto">
          <CardContent className="pt-8 pb-8 space-y-6">
            <h2 className="text-3xl font-bold">Pronto para mudar sua vida?</h2>
            <p className="text-muted-foreground">
              Junte-se a milhares de pessoas que já deram o primeiro passo rumo à liberdade
            </p>
            <Button onClick={() => navigate("/dashboard")} size="lg" variant="hero" className="text-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Começar Minha Jornada
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Viva+ Livre. Feito com 💚 para você.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
