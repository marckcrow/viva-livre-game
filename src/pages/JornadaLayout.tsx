import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Compass, Sun, CalendarRange, BookOpen, Flame, LayoutDashboard, Library, TrendingUp, ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import PausaEstoica from "@/components/jornada/PausaEstoica";

const NAV = [
  { to: "/jornada", label: "Meu dia", icon: Sun, end: true },
  { to: "/jornada/45-dias", label: "Jornada de 45 dias", icon: CalendarRange },
  { to: "/jornada/diario", label: "Diário estoico", icon: BookOpen },
  { to: "/jornada/habitos", label: "Hábitos e virtudes", icon: Flame },
  { to: "/jornada/painel-vida", label: "Painel da vida", icon: LayoutDashboard },
  { to: "/jornada/biblioteca", label: "Biblioteca prática", icon: Library },
  { to: "/jornada/evolucao", label: "Minha evolução", icon: TrendingUp },
];

const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
  <nav className="flex flex-col gap-1">
    {NAV.map(({ to, label, icon: Icon, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-muted"
          }`
        }
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
);

const JornadaLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const current = NAV.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} aria-label="Voltar ao painel">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Compass className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0">
              <h1 className="font-display text-lg leading-tight truncate">Jornada Estoica</h1>
              <p className="text-xs text-muted-foreground truncate">Viva com direção — {current?.label}</p>
            </div>
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Abrir menu">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="pt-6">
                  <NavList />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 grid gap-6 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <div className="sticky top-20">
            <NavList />
          </div>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>

      <PausaEstoica />
    </div>
  );
};

export default JornadaLayout;
