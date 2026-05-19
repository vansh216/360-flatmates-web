import { useState } from "react";
import { X, Smartphone, ArrowRight } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { Button } from "../ui/Button";
import { cn } from "../ui/component-utils";
import { PWAInstallInstructionsModal } from "../organisms/PWAInstallInstructionsModal";

interface PWAInstallBannerProps {
  className?: string;
}

export function PWAInstallBanner({ className }: PWAInstallBannerProps) {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("pwa-banner-dismissed") === "true";
  });
  const [showInstructions, setShowInstructions] = useState(false);

  const handleDismiss = () => {
    sessionStorage.setItem("pwa-banner-dismissed", "true");
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (isInstallable) {
      await installApp();
    } else if (isIOS) {
      setShowInstructions(true);
    }
  };

  const visible = !isInstalled && (isInstallable || isIOS) && !dismissed;

  if (!visible) return null;

  return (
    <>
      <div
        className={cn(
          "relative flex flex-col items-start justify-between gap-4 rounded-2xl border border-accent/25 bg-accent-soft p-4 shadow-sm sm:flex-row sm:items-center",
          className
        )}
      >
        <button
          aria-label="Dismiss banner"
          onClick={handleDismiss}
          className="absolute right-3 top-3 text-ink-3 hover:text-ink transition-colors duration-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 pr-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-body-md font-semibold text-ink">Get the 360 Flatmates App</h3>
            <p className="mt-0.5 text-caption text-ink-2">
              Install the app on your screen for a faster, full-screen matching experience.
            </p>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
          <Button size="compact" variant="primary" onClick={handleInstall} className="w-full sm:w-auto">
            Install <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <PWAInstallInstructionsModal open={showInstructions} onClose={() => setShowInstructions(false)} />
    </>
  );
}
