import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Compass,
  Shield,
  Feather,
  Flame,
  Heart,
  Mountain,
  Scroll,
  Sunrise,
  Sparkles,
} from "lucide-react";
import { getDailyQuote } from "@/data/stoicContent";
import { useOnboarding } from "@/hooks/useOnboarding";

const Index = () => {
  const navigate = useNavigate();
  const quote = getDailyQuote();
  const { data } = useOnboarding();

  const startPath = data.completed ? "/dashboard" : "/onboarding";

  return (
    <div className="min-h-screen bg-background">
      {/* Top ribbon */}
      <div className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="font-display text-xl">Viva+ Livre</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/donate")}>
              <Heart className="w-4 h-4 mr-1" /> Apoiar
            </Button>
            <Button size="sm" onClick={() => navigate(startPath)}>
              Entrar
            </Button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -bottom-24 -left-16"><Mountain className="w-96 h-96" strokeWidth={0.5} /></div>
          <div className="absolute -top-16 -right-10"><Sunrise className="w-80 h-80" strokeWidth={0.5} /></div>
        </div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary-foreground/30 rounded-full text-xs uppercase tracking-widest mb-6">
              <Scroll className="w-3 h-3" /> Jornada Estoica de Autodomínio
            </div>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] text-balance">
              Viva<span className="text-accent">+</span> Livre
            </h1>
            <p className="mt-6 font-display italic text-xl md:text-2xl text-primary-foreground/90 max-w-2xl text-balance">
              Uma jornada para vencer vícios, dominar impulsos e reconstruir sua vida com
              sabedoria, disciplina e propósito.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button size="lg" variant="achievement" onClick={() => navigate(startPath)}>
                Começar minha jornada
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => {
                document.getElementById("method")?.scrollIntoView({ behavior: "smooth" });
              }}>
                Conhecer o método
              </Button>
              <Button size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/donate")}>
                <Heart className="w-4 h-4 mr-1" /> Apoiar com doação
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Daily quote strip */}
      <section className="parchment border-b">
        <div className="container mx-auto px-4 py-10 text-center">
          <p className="text-xs uppercase tracking-widest text-accent mb-3">Palavra do dia</p>
          <p className="font-display italic text-2xl md:text-3xl text-balance max-w-3xl mx-auto text-foreground/85">
            "{quote.text}"
          </p>
          <p className="mt-3 text-sm uppercase tracking-widest text-muted-foreground">— {quote.author}</p>
        </div>
      </section>

      {/* Para quem é */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-accent mb-2">Para quem é</p>
          <h2 className="font-display text-4xl md:text-5xl">Uma caminhada de reconstrução</h2>
          <p className="mt-4 text-muted-foreground text-balance">
            Para quem quer parar de beber, fumar ou usar. Para quem quer reduzir maus hábitos. Para quem
            busca disciplina, controle emocional, propósito e uma vida mais serena.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Álcool, cigarro e drogas", "Reduzir ou abandonar com dignidade e sem julgamento."],
            ["Compulsões cotidianas", "Pornografia, redes sociais, jogos, compras, comida."],
            ["Emoções e propósito", "Ansiedade, raiva, procrastinação, codependência, autoestima."],
          ].map(([t, d]) => (
            <div key={t} className="p-6 border border-border rounded-lg bg-card">
              <h3 className="font-display text-2xl">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Método */}
      <section id="method" className="parchment border-y">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-accent mb-2">O método</p>
            <h2 className="font-display text-4xl md:text-5xl">O que você pode transformar</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Compass, title: "Missão diária", desc: "Uma prática estoica por dia para treinar sua resposta aos impulsos." },
              { icon: Feather, title: "Diário estoico", desc: "Manhã e noite: examine o dia com honestidade e sem culpa." },
              { icon: Shield, title: "Plano de resistência", desc: "Gatilhos mapeados, respostas preparadas, força construída." },
              { icon: Flame, title: "Recomeço digno", desc: "Uma queda não apaga sua caminhada. Levante, aprenda, continue." },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="shadow-soft border-border/60">
                <CardContent className="pt-6 space-y-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-xl">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-accent mb-2">Benefícios</p>
          <h2 className="font-display text-4xl md:text-5xl">O que floresce em você</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {[
            "Saúde física restaurada",
            "Finanças reconstruídas",
            "Autocontrole verdadeiro",
            "Clareza mental",
            "Paz emocional",
            "Disciplina diária",
            "Propósito renovado",
            "Relações mais honestas",
            "Sentido espiritual",
          ].map((b) => (
            <div key={b} className="flex items-center gap-3 p-4 rounded-md border border-border/60 bg-card">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="font-display text-lg">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-hero border-0 text-primary-foreground max-w-3xl mx-auto shadow-glow">
          <CardContent className="p-10 md:p-14 text-center space-y-5">
            <h2 className="font-display text-4xl md:text-5xl text-balance">
              Você não controla tudo o que acontece.<br />
              Mas pode treinar sua resposta.
            </h2>
            <p className="text-primary-foreground/85 max-w-xl mx-auto">
              Um dia por vez. Sem promessas milagrosas. Sem julgamento.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button size="lg" variant="achievement" onClick={() => navigate(startPath)}>
                Começar gratuitamente
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/donate")}>
                <Heart className="w-4 h-4 mr-1" /> Ajude a manter vivo
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Disclaimer + Footer */}
      <footer className="border-t mt-8">
        <div className="container mx-auto px-4 py-10 space-y-4 text-center text-sm text-muted-foreground">
          <p className="max-w-2xl mx-auto italic">
            Esta plataforma é educativa e de apoio. Não substitui acompanhamento médico, psicológico ou
            terapêutico. Em situações de crise, abstinência grave ou risco à vida, procure ajuda
            profissional e serviços de emergência.
          </p>
          <p>© {new Date().getFullYear()} Viva+ Livre · Feito com serenidade para quem recomeça.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
