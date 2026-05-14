import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Share2, PlusSquare, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const BANNER_DISMISSED_KEY = "pwa-install-banner-dismissed";

const InstallBanner = () => {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (dismissed === "true") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    setIsIos(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Se for iOS, mostrar banner mesmo sem deferredPrompt
    if (ios) {
      setVisible(true);
    }

    const installedHandler = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(BANNER_DISMISSED_KEY, "true");
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
      setVisible(false);
    }
  };

  if (!visible || isStandalone) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-card border-t shadow-lg px-4 py-3">
        <div className="container mx-auto max-w-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Instale o Viva+ Livre
              </p>
              {isIos ? (
                <p className="text-xs text-muted-foreground truncate">
                  Toque <Share2 className="inline w-3 h-3 mx-0.5" /> e depois{" "}
                  <PlusSquare className="inline w-3 h-3 mx-0.5" /> "Adicionar à Tela de Início"
                </p>
              ) : (
                <p className="text-xs text-muted-foreground truncate">
                  Acesse mais rápido. Funciona offline.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isIos && deferredPrompt && (
              <Button onClick={handleInstall} size="sm" className="gap-1.5 h-8">
                <Download className="w-3.5 h-3.5" />
                Instalar
              </Button>
            )}
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;
