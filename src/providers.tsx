import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react-router";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useSSE } from "@/hooks/useSSE";
import { ApiClientError, setAccessToken, setRefreshTokenHandler } from "@/lib/api";
import { uiStore } from "@/lib/stores/ui-store";
import type { PalettePreference, ThemePreference } from "@/lib/stores/ui-store";
import { Toast, ToastViewport } from "@/components/ui/Toast";

const TOKEN_REFRESH_KEY = "__auth_refresh_in_flight";

function ProviderInternals({
  children,
  onForceLogout
}: {
  children: ReactNode;
  onForceLogout: () => void;
}) {
  const { session, loading } = useAuth();

  const isAuthenticated = !loading && !!session;

  useEffect(() => {
    const token = session?.access_token ?? null;
    setAccessToken(token);
  }, [session?.access_token, loading]);

  useEffect(() => {
    setRefreshTokenHandler(async () => {
      try {
        const { getSupabaseBrowserClient } = await import(
          "@/lib/supabase/client"
        );
        const supabase = getSupabaseBrowserClient();

        if (window.sessionStorage.getItem(TOKEN_REFRESH_KEY)) {
          await new Promise((r) => {
            const check = setInterval(() => {
              if (!window.sessionStorage.getItem(TOKEN_REFRESH_KEY)) {
                clearInterval(check);
                r(undefined);
              }
            }, 100);
          });
          const { data } = await supabase.auth.getSession();
          return data.session?.access_token ?? null;
        }

        window.sessionStorage.setItem(TOKEN_REFRESH_KEY, "1");
        try {
          const { data, error } = await supabase.auth.refreshSession();
          if (error) throw error;
          const newToken = data.session?.access_token ?? null;
          if (newToken) setAccessToken(newToken);
          return newToken;
        } finally {
          window.sessionStorage.removeItem(TOKEN_REFRESH_KEY);
        }
      } catch {
        return null;
      }
    });

    return () => setRefreshTokenHandler(null);
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    return session?.access_token ?? null;
  }, [session?.access_token]);

  useSSE(isAuthenticated, getToken);

  useEffect(() => {
    const applyTheme = (theme: ThemePreference) => {
      const isDark =
        theme === "dark" ||
        (theme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      if (isDark) {
        document.documentElement.dataset.theme = "dark";
      } else {
        delete document.documentElement.dataset.theme;
      }
    };

    const applyPalette = (palette: PalettePreference) => {
      document.documentElement.dataset.palette = palette;
    };

    applyTheme(uiStore.getState().theme);
    applyPalette(uiStore.getState().palette);

    const unsub = uiStore.subscribe((state) => {
      applyTheme(state.theme);
      applyPalette(state.palette);
    });

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (uiStore.getState().theme === "system") {
        applyTheme("system");
      }
    };
    mql.addEventListener("change", onSystemChange);

    return () => {
      unsub();
      mql.removeEventListener("change", onSystemChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return children;
}

function ToastContainer() {
  const [toasts, setToasts] = useState(uiStore.getState().toasts);
  const toastsRef = useRef(toasts);

  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

  useEffect(() => {
    const unsub = uiStore.subscribe((state) => {
      if (state.toasts !== toastsRef.current) {
        toastsRef.current = state.toasts;
        setToasts(state.toasts);
      }
    });
    return unsub;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <ToastViewport>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          description={toast.description}
          onClick={() => uiStore.getState().dismissToast(toast.id)}
        />
      ))}
    </ToastViewport>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const onForceLogout = useCallback(() => {
    import("@/lib/supabase/client").then(({ getSupabaseBrowserClient }) => {
      getSupabaseBrowserClient().auth.signOut();
    });
    window.location.href = "/login";
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (
                error instanceof ApiClientError &&
                error.appError.type === "auth"
              ) {
                if (failureCount === 0) return true;
                return false;
              }
              return failureCount < 1;
            },
            staleTime: 60_000
          }
        }
      })
  );

  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <ProviderInternals onForceLogout={onForceLogout}>{children}</ProviderInternals>
        <ToastContainer />
      </QueryClientProvider>
    </NuqsAdapter>
  );
}
