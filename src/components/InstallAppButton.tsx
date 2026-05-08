import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallAppButton = ({ variant = "default" }: { variant?: "default" | "ghost" | "outline" | "secondary" }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    // Already installed?
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const installedHandler = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      toast({ title: "App instalado! 🎉", description: "Agora você pode abrir o Viva+ Livre direto da sua tela inicial." });
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    // iOS doesn't fire beforeinstallprompt — show manual hint
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    if (isIos && !isStandalone) setIosHint(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (iosHint && !deferredPrompt) {
      toast({
        title: "Instalar no iPhone/iPad",
        description: "Toque no ícone Compartilhar e em 'Adicionar à Tela de Início'.",
      });
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  if (installed) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2">
        <Check className="w-4 h-4" /> Instalado
      </Button>
    );
  }

  if (!deferredPrompt && !iosHint) return null;

  return (
    <Button onClick={handleInstall} variant={variant} size="sm" className="gap-2">
      <Download className="w-4 h-4" />
      Instalar app
    </Button>
  );
};

export default InstallAppButton;
