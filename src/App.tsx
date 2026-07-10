import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Donate from "./pages/Donate";
import History from "./pages/History";
import Transparency from "./pages/Transparency";
import Auth from "./pages/Auth";
import Community from "./pages/Community";
import Onboarding from "./pages/Onboarding";
import JornadaLayout from "./pages/JornadaLayout";
import MeuDia from "./pages/jornada/MeuDia";
import JornadaEmBreve from "./pages/jornada/JornadaEmBreve";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/history" element={<History />} />
          <Route path="/transparencia" element={<Transparency />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/community" element={<Community />} />
          <Route path="/jornada" element={<JornadaLayout />}>
            <Route index element={<MeuDia />} />
            <Route path="45-dias" element={<JornadaEmBreve title="Jornada de 45 dias" description="Uma trilha progressiva em seis etapas, do reconhecimento à direção de vida." />} />
            <Route path="diario" element={<JornadaEmBreve title="Diário estoico" description="Reflexões da manhã e da noite, com registro rápido de 1 minuto." />} />
            <Route path="habitos" element={<JornadaEmBreve title="Hábitos e virtudes" description="Rastreador semanal de hábitos e acompanhamento das virtudes praticadas." />} />
            <Route path="painel-vida" element={<JornadaEmBreve title="Painel da vida" description="Notas mensais em doze áreas — sem diagnósticos, só direção." />} />
            <Route path="biblioteca" element={<JornadaEmBreve title="Biblioteca prática" description="Conteúdos curtos e originais para aplicar no dia a dia." />} />
            <Route path="evolucao" element={<JornadaEmBreve title="Minha evolução" description="Revisão semanal e mensal com resumo do seu percurso." />} />
          </Route>
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
