import { useEffect, useState } from "react";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://")
    );
  });
  const [isIOS] = useState(() => {
    if (typeof window === "undefined") return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /ipad|iphone|ipod/.test(userAgent) && !("MSStream" in window);
  });

  useEffect(() => {
    // 1. Listen for the native beforeinstallprompt event (Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the browser's default mini-infobar prompt
      e.preventDefault();
      // Store the event so we can trigger it on user action
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // 2. Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async (): Promise<boolean> => {
    if (!installPromptEvent) {
      console.warn("PWA installation prompt is not available.");
      return false;
    }

    try {
      // Trigger the native browser prompt
      await installPromptEvent.prompt();

      // Wait for the user's decision
      const { outcome } = await installPromptEvent.userChoice;
      if (outcome === "accepted") {
        setIsInstallable(false);
        setInstallPromptEvent(null);
        return true;
      }
    } catch (error) {
      console.error("Failed to install app:", error);
    }
    return false;
  };

  return {
    isInstallable,
    isInstalled,
    isIOS,
    installApp,
  };
}
