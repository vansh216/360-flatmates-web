import { describe, it, expect, beforeEach } from "vitest";
import { useMapStore } from "../map-store";

describe("useMapStore", () => {
  beforeEach(() => {
    useMapStore.setState(useMapStore.getInitialState());
  });

  it("should have correct initial state", () => {
    const state = useMapStore.getState();
    expect(state.center).toEqual({ lat: 28.6139, lng: 77.209 });
    expect(state.zoom).toBe(12);
    expect(state.selectedPinId).toBeNull();
    expect(state.filters).toEqual({});
    expect(state.bounds).toBeNull();
  });

  it("setCenter updates center coordinates", () => {
    useMapStore.getState().setCenter({ lat: 19.076, lng: 72.8777 });
    expect(useMapStore.getState().center).toEqual({ lat: 19.076, lng: 72.8777 });
  });

  it("setZoom updates zoom level", () => {
    useMapStore.getState().setZoom(15);
    expect(useMapStore.getState().zoom).toBe(15);
  });

  it("setSelectedPin sets selectedPinId", () => {
    useMapStore.getState().setSelectedPin(99);
    expect(useMapStore.getState().selectedPinId).toBe(99);
  });

  it("clearSelectedPin sets selectedPinId to null", () => {
    useMapStore.getState().setSelectedPin(99);
    useMapStore.getState().clearSelectedPin();
    expect(useMapStore.getState().selectedPinId).toBeNull();
  });

  it("setFilters updates filters", () => {
    useMapStore.getState().setFilters({ propertyType: ["apartment"], priceMin: 5000 });
    const filters = useMapStore.getState().filters;
    expect(filters.propertyType).toEqual(["apartment"]);
    expect(filters.priceMin).toBe(5000);
  });

  it("clearFilters resets filters to empty", () => {
    useMapStore.getState().setFilters({ propertyType: ["house"], priceMax: 20000 });
    useMapStore.getState().clearFilters();
    expect(useMapStore.getState().filters).toEqual({});
  });

  it("setBounds updates bounds", () => {
    const bounds = { north: 29, south: 28, east: 78, west: 76 };
    useMapStore.getState().setBounds(bounds);
    expect(useMapStore.getState().bounds).toEqual(bounds);
  });

  it("clearBounds sets bounds to null", () => {
    useMapStore.getState().setBounds({ north: 29, south: 28, east: 78, west: 76 });
    useMapStore.getState().clearBounds();
    expect(useMapStore.getState().bounds).toBeNull();
  });
});
