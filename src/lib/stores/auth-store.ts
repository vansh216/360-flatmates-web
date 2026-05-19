import { createStore } from "zustand/vanilla";
import type { Session, User } from "@supabase/supabase-js";

export interface AuthStoreState {
  /** Supabase user object (null when signed out or still loading) */
  user: User | null;
  /** Supabase session object (null when signed out or still loading) */
  session: Session | null;
  /** True while the initial getSession() call is in progress */
  loading: boolean;

  /* ── UI-level auth state ── */
  isLoginModalOpen: boolean;
  pendingRedirect: string | null;
  authError: string | null;

  /* ── Actions ── */
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  setPendingRedirect: (path: string) => void;
  clearPendingRedirect: () => void;
  setAuthError: (error: string) => void;
  clearAuthError: () => void;
}

export const authStore = createStore<AuthStoreState>()((set) => ({
  user: null,
  session: null,
  loading: true,

  isLoginModalOpen: false,
  pendingRedirect: null,
  authError: null,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),

  setLoading: (loading) => set((s) => (s.loading === loading ? s : { loading })),

  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  setPendingRedirect: (path) => set({ pendingRedirect: path }),
  clearPendingRedirect: () => set({ pendingRedirect: null }),

  setAuthError: (error) => set({ authError: error }),
  clearAuthError: () => set({ authError: null }),
}));
