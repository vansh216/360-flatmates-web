import { create } from "zustand";
import type { FlatmatesPeer } from "@/lib/api/types";

export interface SwipeStoreState {
  currentIndex: number;
  isAnimating: boolean;
  direction: "left" | "right" | "up" | null;
  cardQueue: FlatmatesPeer[];
  isExpanded: boolean;
  incrementIndex: () => void;
  resetIndex: () => void;
  setAnimating: (animating: boolean) => void;
  setDirection: (direction: "left" | "right" | "up") => void;
  clearDirection: () => void;
  setCardQueue: (queue: FlatmatesPeer[]) => void;
  shiftCard: () => void;
  pushCards: (cards: FlatmatesPeer[]) => void;
  toggleExpanded: () => void;
  setExpanded: (expanded: boolean) => void;
}

export const useSwipeStore = create<SwipeStoreState>()((set) => ({
  currentIndex: 0,
  isAnimating: false,
  direction: null,
  cardQueue: [],
  isExpanded: false,

  incrementIndex: () =>
    set((state) => ({ currentIndex: state.currentIndex + 1 })),
  resetIndex: () => set({ currentIndex: 0 }),

  setAnimating: (isAnimating) => set({ isAnimating }),

  setDirection: (direction) => set({ direction }),
  clearDirection: () => set({ direction: null }),

  setCardQueue: (cardQueue) => set({ cardQueue, currentIndex: 0 }),
  shiftCard: () =>
    set((state) => ({
      cardQueue: state.cardQueue.slice(1),
      currentIndex: 0
    })),
  pushCards: (cards) =>
    set((state) => ({
      cardQueue: [...state.cardQueue, ...cards]
    })),

  toggleExpanded: () =>
    set((state) => ({ isExpanded: !state.isExpanded })),
  setExpanded: (isExpanded) => set({ isExpanded })
}));
