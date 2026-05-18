import { describe, it, expect, beforeEach } from "vitest";
import { useSwipeStore } from "../swipe-store";
import type { FlatmatesPeer } from "@/lib/api/types";

const mockPeer: FlatmatesPeer = {
  id: 1,
  full_name: "Alice",
  mode: "co_hunter" as FlatmatesPeer["mode"],
  profile_image_url: "https://example.com/alice.jpg",
};

const mockPeer2: FlatmatesPeer = {
  id: 2,
  full_name: "Bob",
  mode: "room_poster" as FlatmatesPeer["mode"],
};

describe("useSwipeStore", () => {
  beforeEach(() => {
    useSwipeStore.setState(useSwipeStore.getInitialState());
  });

  it("should have correct initial state", () => {
    const state = useSwipeStore.getState();
    expect(state.currentIndex).toBe(0);
    expect(state.isAnimating).toBe(false);
    expect(state.direction).toBeNull();
    expect(state.cardQueue).toEqual([]);
    expect(state.isExpanded).toBe(false);
  });

  it("incrementIndex increments currentIndex", () => {
    useSwipeStore.getState().incrementIndex();
    expect(useSwipeStore.getState().currentIndex).toBe(1);

    useSwipeStore.getState().incrementIndex();
    expect(useSwipeStore.getState().currentIndex).toBe(2);
  });

  it("resetIndex resets currentIndex to 0", () => {
    useSwipeStore.getState().incrementIndex();
    useSwipeStore.getState().incrementIndex();
    useSwipeStore.getState().resetIndex();
    expect(useSwipeStore.getState().currentIndex).toBe(0);
  });

  it("setAnimating sets isAnimating", () => {
    useSwipeStore.getState().setAnimating(true);
    expect(useSwipeStore.getState().isAnimating).toBe(true);

    useSwipeStore.getState().setAnimating(false);
    expect(useSwipeStore.getState().isAnimating).toBe(false);
  });

  it("setDirection sets direction", () => {
    useSwipeStore.getState().setDirection("left");
    expect(useSwipeStore.getState().direction).toBe("left");

    useSwipeStore.getState().setDirection("right");
    expect(useSwipeStore.getState().direction).toBe("right");

    useSwipeStore.getState().setDirection("up");
    expect(useSwipeStore.getState().direction).toBe("up");
  });

  it("clearDirection sets direction to null", () => {
    useSwipeStore.getState().setDirection("left");
    useSwipeStore.getState().clearDirection();
    expect(useSwipeStore.getState().direction).toBeNull();
  });

  it("setCardQueue sets the queue and resets currentIndex", () => {
    useSwipeStore.getState().incrementIndex();
    useSwipeStore.getState().setCardQueue([mockPeer, mockPeer2]);
    expect(useSwipeStore.getState().cardQueue).toEqual([mockPeer, mockPeer2]);
    expect(useSwipeStore.getState().currentIndex).toBe(0);
  });

  it("shiftCard removes the first card and resets currentIndex", () => {
    useSwipeStore.getState().setCardQueue([mockPeer, mockPeer2]);
    useSwipeStore.getState().incrementIndex();
    useSwipeStore.getState().shiftCard();
    expect(useSwipeStore.getState().cardQueue).toEqual([mockPeer2]);
    expect(useSwipeStore.getState().currentIndex).toBe(0);
  });

  it("pushCards appends cards to the queue", () => {
    useSwipeStore.getState().setCardQueue([mockPeer]);
    useSwipeStore.getState().pushCards([mockPeer2]);
    expect(useSwipeStore.getState().cardQueue).toEqual([mockPeer, mockPeer2]);
  });

  it("toggleExpanded flips isExpanded", () => {
    useSwipeStore.getState().toggleExpanded();
    expect(useSwipeStore.getState().isExpanded).toBe(true);

    useSwipeStore.getState().toggleExpanded();
    expect(useSwipeStore.getState().isExpanded).toBe(false);
  });

  it("setExpanded sets isExpanded directly", () => {
    useSwipeStore.getState().setExpanded(true);
    expect(useSwipeStore.getState().isExpanded).toBe(true);

    useSwipeStore.getState().setExpanded(false);
    expect(useSwipeStore.getState().isExpanded).toBe(false);
  });
});
