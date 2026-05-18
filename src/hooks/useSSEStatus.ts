import { useStore } from "zustand";
import { uiStore } from "@/lib/stores/ui-store";
import { SSEConnectionState } from "@/lib/sse/types";

interface SSEStatusReturn {
  state: SSEConnectionState;
  isConnected: boolean;
  reconnecting: boolean;
}

/**
 * Hook that exposes the current SSE connection state from the
 * Zustand UI store. Use this in UI components that need to
 * display a connection status indicator.
 */
export function useSSEStatus(): SSEStatusReturn {
  const state = useStore(uiStore, (s) => s.sseState);

  return {
    state,
    isConnected: state === SSEConnectionState.Connected,
    reconnecting: state === SSEConnectionState.Reconnecting,
  };
}
