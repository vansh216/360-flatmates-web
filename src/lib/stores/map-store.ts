import { create } from "zustand";

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

const DEFAULT_CENTER: MapViewport = { lat: 28.6139, lng: 77.209 }; // New Delhi
const DEFAULT_ZOOM = 12;
const EMPTY_FILTERS: MapFilters = {};

export const useMapStore = create<MapStoreState>()((set) => ({
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  selectedPinId: null,
  filters: { ...EMPTY_FILTERS },
  bounds: null,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),

  setSelectedPin: (id) => set({ selectedPinId: id }),
  clearSelectedPin: () => set({ selectedPinId: null }),

  setFilters: (filters) => set({ filters: { ...filters } }),
  clearFilters: () => set({ filters: { ...EMPTY_FILTERS } }),

  setBounds: (bounds) => set({ bounds }),
  clearBounds: () => set({ bounds: null })
}));
