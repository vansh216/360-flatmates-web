import { createStore } from "zustand/vanilla";

export interface MapViewport {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapFilters {
  propertyType?: string[];
  priceMin?: number;
  priceMax?: number;
}

export interface MapStoreState {
  center: MapViewport;
  zoom: number;
  selectedPinId: number | null;
  filters: MapFilters;
  bounds: MapBounds | null;
  setCenter: (center: MapViewport) => void;
  setZoom: (zoom: number) => void;
  setSelectedPin: (id: number) => void;
  clearSelectedPin: () => void;
  setFilters: (filters: MapFilters) => void;
  clearFilters: () => void;
  setBounds: (bounds: MapBounds) => void;
  clearBounds: () => void;
}

export const DEFAULT_CENTER: MapViewport = { lat: 28.6139, lng: 77.209 }; // New Delhi
const DEFAULT_ZOOM = 12;
const EMPTY_FILTERS: MapFilters = {};

/** Compare two MapFilters objects without JSON.stringify */
function mapFiltersEqual(a: MapFilters, b: MapFilters): boolean {
  if (a.priceMin !== b.priceMin || a.priceMax !== b.priceMax) return false;
  const aTypes = a.propertyType;
  const bTypes = b.propertyType;
  if (aTypes === bTypes) return true;
  if (!aTypes || !bTypes || aTypes.length !== bTypes.length) return false;
  return aTypes.every((v, i) => v === bTypes[i]);
}

export const mapStore = createStore<MapStoreState>()((set) => ({
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  selectedPinId: null,
  filters: { ...EMPTY_FILTERS },
  bounds: null,

  setCenter: (center) =>
    set((state) => (state.center.lat === center.lat && state.center.lng === center.lng ? state : { center })),
  setZoom: (zoom) =>
    set((state) => (state.zoom === zoom ? state : { zoom })),

  setSelectedPin: (id) => set({ selectedPinId: id }),
  clearSelectedPin: () => set({ selectedPinId: null }),

  setFilters: (filters) =>
    set((state) => {
      if (mapFiltersEqual(filters, state.filters)) return state;
      return { filters: { ...filters } };
    }),
  clearFilters: () =>
    set((state) => {
      if (mapFiltersEqual(state.filters, EMPTY_FILTERS)) return state;
      return { filters: { ...EMPTY_FILTERS } };
    }),

  setBounds: (bounds) =>
    set((state) => {
      if (!state.bounds) return { bounds };
      if (
        state.bounds.north === bounds.north &&
        state.bounds.south === bounds.south &&
        state.bounds.east === bounds.east &&
        state.bounds.west === bounds.west
      ) return state;
      return { bounds };
    }),
  clearBounds: () => set({ bounds: null })
}));
