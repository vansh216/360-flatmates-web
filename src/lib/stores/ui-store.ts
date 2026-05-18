import { createStore } from "zustand/vanilla";
import { persist } from "zustand/middleware";
import { createSafeJsonStorage } from "./storage";
import { type SSEConnectionState } from "@/lib/sse/types";

export const UI_STORE_KEY = "360-flatmates-ui";

export type ThemePreference = "light" | "dark" | "system";
export type PalettePreference = "terracotta" | "ember" | "monsoon_teal";
export type SidebarState = "expanded" | "collapsed";

export const SIDEBAR_WIDTH_DEFAULT = 200;
export const SIDEBAR_WIDTH_MIN = 180;
export const SIDEBAR_WIDTH_MAX = 360;
export const SIDEBAR_WIDTH_COLLAPSED = 56;
export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  createdAt: number;
  persistent?: boolean;
}

export interface UiStoreState {
  theme: ThemePreference;
  palette: PalettePreference;
  sidebar: SidebarState;
  sidebarWidth: number;
  activeModal: string | null;
  activeDrawer: string | null;
  sseConnected: boolean;
  sseState: SSEConnectionState;
  ssePrimaryTab: boolean;
  reducedMotion: boolean;
  toasts: ToastMessage[];
  setTheme: (theme: ThemePreference) => void;
  setPalette: (palette: PalettePreference) => void;
  setSidebar: (sidebar: SidebarState) => void;
  setSidebarWidth: (width: number) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  openDrawer: (drawer: string) => void;
  closeDrawer: () => void;
  setSseConnected: (connected: boolean) => void;
  setSSEState: (state: SSEConnectionState) => void;
  setSSEPrimaryTab: (isPrimary: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  pushToast: (toast: Omit<ToastMessage, "id" | "createdAt"> & { id?: string }) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

export type UiStoreInitialState = Partial<
  Pick<
    UiStoreState,
    | "theme"
    | "palette"
    | "sidebar"
    | "sidebarWidth"
    | "activeModal"
    | "activeDrawer"
    | "sseConnected"
    | "sseState"
    | "ssePrimaryTab"
    | "reducedMotion"
    | "toasts"
  >
>;

function createToastId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createUiStore(initialState: UiStoreInitialState = {}) {
  return createStore<UiStoreState>()(
    persist(
      (set) => ({
        theme: "light",
        palette: "terracotta",
        sidebar: "expanded",
        sidebarWidth: SIDEBAR_WIDTH_DEFAULT,
        activeModal: null,
        activeDrawer: null,
        sseConnected: false,
        sseState: "disconnected" as SSEConnectionState,
        ssePrimaryTab: false,
        reducedMotion: false,
        toasts: [],
        ...initialState,
        setTheme: (theme) => set({ theme }),
        setPalette: (palette) => set({ palette }),
        setSidebar: (sidebar) => set({ sidebar }),
        setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
        openModal: (activeModal) => set({ activeModal }),
        closeModal: () => set({ activeModal: null }),
        openDrawer: (activeDrawer) => set({ activeDrawer }),
        closeDrawer: () => set({ activeDrawer: null }),
        setSseConnected: (sseConnected) => set({ sseConnected }),
        setSSEState: (sseState) => set({ sseState }),
        setSSEPrimaryTab: (ssePrimaryTab) => set({ ssePrimaryTab }),
        setReducedMotion: (reducedMotion) => set({ reducedMotion }),
        pushToast: (toast) => {
          const id = toast.id ?? createToastId();
          set((state) => ({
            toasts: [
              ...state.toasts.slice(-2),
              { ...toast, id, createdAt: Date.now() }
            ]
          }));
          return id;
        },
        dismissToast: (id) =>
          set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id)
          })),
        clearToasts: () => set({ toasts: [] })
      }),
      {
        name: UI_STORE_KEY,
        storage: createSafeJsonStorage(),
        partialize: (state) => ({
          theme: state.theme,
          palette: state.palette,
          sidebar: state.sidebar,
          sidebarWidth: state.sidebarWidth,
          reducedMotion: state.reducedMotion
        })
      }
    )
  );
}

export const uiStore = createUiStore();

