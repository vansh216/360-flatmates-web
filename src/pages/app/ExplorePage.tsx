import React, { Suspense, useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useStore } from "zustand";
import { X, MapPin as MapPinIcon, ShieldCheck, BedDouble, Bath, Ruler, Calendar } from "lucide-react";
import { useMapView, useProperty } from "@/hooks/queries";
import { searchStore } from "@/lib/stores/search-store";
import type { MapCluster, MapViewFilters, SearchFilters, MapPin as MapPinType } from "@/lib/api/types";
import {
  LISTING_SHARING_TYPE_OPTIONS,
  GENDER_PREFERENCE_VALUES,
  MOVE_IN_TIMELINE_OPTIONS,
  PROPERTY_TYPE_VALUES,
} from "@/lib/data/domain";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/StateViews";
import { FilterPanel, type FilterSection } from "@/components/molecules/FilterPanel";
import { BottomSheet, Drawer } from "@/components/ui/Modal";
import { NetworkImage } from "@/components/ui/NetworkImage";
import { PriceText } from "@/components/ui/PriceText";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrencyINR } from "@/lib/utils/format";
import type { MapBounds } from "@/lib/stores/map-store";

// Lazy import: Leaflet requires `window` and cannot render on the server.
const MapView = React.lazy(
  () => import("@/components/organisms/MapView").then((mod) => ({ default: mod.MapView }))
);

const MapViewFallback = () => (
  <div className="flex h-full items-center justify-center bg-paper-2">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
  </div>
);

// Default center: Gurgaon (intentionally different from map-store's New Delhi default)
const DEFAULT_CENTER: [number, number] = [28.4595, 77.0266];
const DEFAULT_ZOOM = 12;

export function ExplorePage() {
  const navigate = useNavigate();
  const filters = useStore(searchStore, (s) => s.filters);
  const setFilter = useStore(searchStore, (s) => s.setFilter);
  const setFilters = useStore(searchStore, (s) => s.setFilters);
  const resetFilters = useStore(searchStore, (s) => s.resetFilters);

  // Filter panel state
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // Selected pin for inline property card
  const [selectedPin, setSelectedPin] = useState<MapPinType | null>(null);

  // Fetch full details of the selected property
  const { data: fullProperty, isLoading: isPropertyLoading } = useProperty(selectedPin?.id ?? 0);

  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

  // Map API query
  const mapFilters: MapViewFilters = useMemo(
    () => ({
      lat: mapCenter[0],
      lng: mapCenter[1],
      zoom_level: mapZoom,
      radius: 5,
      price_min: filters.price_min,
      price_max: filters.price_max,
      sharing_type: filters.sharing_type
    }),
    [mapCenter, mapZoom, filters.price_min, filters.price_max, filters.sharing_type]
  );

  const {
    data: mapData,
    isLoading,
    error,
    refetch,
  } = useMapView(mapFilters);

  const activeFilters = useMemo(
    () =>
      [
        filters.city,
        filters.locality,
        filters.sharing_type?.[0],
        filters.move_in?.[0]
      ].filter(Boolean) as string[],
    [filters.city, filters.locality, filters.sharing_type, filters.move_in]
  );

  // Handle map viewport changes (pan/zoom)
  const handleViewportChange = useCallback((bounds: MapBounds, zoom: number) => {
    const newCenter: [number, number] = [
      (bounds.north + bounds.south) / 2,
      (bounds.east + bounds.west) / 2
    ];
    setMapCenter(newCenter);
    setMapZoom(zoom);
  }, []);

  // Handle pin selection: toggle selected pin for inline card
  const handlePinSelect = useCallback(
    (pin: MapPinType) => {
      setSelectedPin((prev) => (prev?.id === pin.id ? null : pin));
    },
    []
  );

  // Handle cluster click: zoom into the cluster area
  const handleClusterClick = useCallback(
    (_cluster: MapCluster) => {
      // Cluster click triggers zoom-in via the map component;
      // the viewport change handler will automatically refetch
      // with updated bounds.
    },
    []
  );

  // Handle locate me
  const handleLocate = useCallback(() => {
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        setMapCenter([position.coords.latitude, position.coords.longitude]);
        setMapZoom(14);
      },
      () => {
        // On error, stay at default center
      }
    );
  }, []);

  // Build filter sections for FilterPanel
  const filterSections: FilterSection[] = useMemo(
    () => [
      {
        id: "property_type",
        title: "Property Type",
        options: PROPERTY_TYPE_VALUES.map((pt) => ({
          value: pt,
          label: pt === "pg" ? "PG" : "Flatmate",
          selected: filters.property_type?.includes(pt) ?? false,
        })),
      },
      {
        id: "sharing_type",
        title: "Sharing Type",
        options: LISTING_SHARING_TYPE_OPTIONS.map((st) => ({
          value: st.value,
          label: st.label,
          selected: filters.sharing_type?.includes(st.value as SearchFilters["sharing_type"] extends (infer U)[] | undefined ? U : never) ?? false,
        })),
      },
      {
        id: "gender_preference",
        title: "Gender Preference",
        options: GENDER_PREFERENCE_VALUES.map((gp) => ({
          value: gp,
          label: gp.charAt(0).toUpperCase() + gp.slice(1),
          selected: filters.gender_preference?.includes(gp as SearchFilters["gender_preference"] extends (infer U)[] | undefined ? U : never) ?? false,
        })),
      },
      {
        id: "move_in",
        title: "Move-in Timeline",
        options: MOVE_IN_TIMELINE_OPTIONS.map((mo) => ({
          value: mo.value,
          label: mo.label,
          selected: filters.move_in?.includes(mo.value as SearchFilters["move_in"] extends (infer U)[] | undefined ? U : never) ?? false,
        })),
      },
      {
        id: "budget",
        title: "Budget",
        options: [
          { value: "under5k", label: "Under ₹5,000", selected: filters.price_max !== undefined && filters.price_max <= 5000 },
          { value: "5k-10k", label: "₹5,000 – ₹10,000", selected: filters.price_min === 5000 && filters.price_max === 10000 },
          { value: "10k-20k", label: "₹10,000 – ₹20,000", selected: filters.price_min === 10000 && filters.price_max === 20000 },
          { value: "20k-30k", label: "₹20,000 – ₹30,000", selected: filters.price_min === 20000 && filters.price_max === 30000 },
          { value: "30k+", label: "₹30,000+", selected: filters.price_min === 30000 && filters.price_max === undefined },
        ],
      },
    ],
    [filters.property_type, filters.sharing_type, filters.gender_preference, filters.move_in, filters.price_min, filters.price_max]
  );

  const handleFilterToggle = useCallback(
    (sectionId: string, value: string) => {
      if (sectionId === "budget") {
        const budgetMap: Record<string, { price_min?: number; price_max?: number }> = {
          under5k: { price_max: 5000 },
          "5k-10k": { price_min: 5000, price_max: 10000 },
          "10k-20k": { price_min: 10000, price_max: 20000 },
          "20k-30k": { price_min: 20000, price_max: 30000 },
          "30k+": { price_min: 30000 },
        };
        const budget = budgetMap[value];
        if (!budget) return;
        // Toggle: if already selected with this budget, clear it
        const isSelected =
          (budget.price_min === filters.price_min || (budget.price_min === undefined && filters.price_min === undefined)) &&
          (budget.price_max === filters.price_max || (budget.price_max === undefined && filters.price_max === undefined));
        if (isSelected) {
          setFilters({ price_min: undefined, price_max: undefined });
        } else {
          setFilters({ ...budget });
        }
        return;
      }

      const currentArray = filters[sectionId as keyof SearchFilters];
      if (!Array.isArray(currentArray)) return;
      const currentStrings = currentArray as string[];
      const next = currentStrings.includes(value)
        ? currentStrings.filter((v) => v !== value)
        : [...currentStrings, value];
      setFilter(sectionId as keyof SearchFilters, next as unknown as SearchFilters[keyof SearchFilters]);
    },
    [filters, setFilter, setFilters]
  );

  const handleClearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const handleApplyFilters = useCallback(() => {
    setFilterPanelOpen(false);
  }, []);

  if (isLoading) {
    return (
      <div className="-mx-5 -mt-6 -mb-6 flex h-[calc(100dvh-64px-76px-env(safe-area-inset-bottom))] md:h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-4 md:-mx-6">
        {/* Map placeholder */}
        <Skeleton className="h-full w-full rounded-none" />
        {/* Floating button placeholders */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="-mx-5 -mt-6 -mb-6 flex h-[calc(100dvh-64px-76px-env(safe-area-inset-bottom))] md:h-[calc(100dvh-4rem)] items-center justify-center md:-mx-6">
        <ErrorState
          title="Could not load map"
          description="Check your connection and try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="-mx-5 -mt-6 -mb-6 flex h-[calc(100dvh-64px-76px-env(safe-area-inset-bottom))] md:h-[calc(100dvh-4rem)] flex-col gap-0 md:-mx-6 md:flex-row page-fade">
      {/* Map area - takes all available space */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <Suspense fallback={<MapViewFallback />}>
          <MapView
            clusters={mapData?.clusters ?? []}
            pins={mapData?.pins ?? []}
            filters={activeFilters}
            center={mapCenter}
            zoom={mapZoom}
            onPinClick={() => {}}
            onPinSelect={handlePinSelect}
            onClusterClick={handleClusterClick}
            onViewportChange={handleViewportChange}
            onLocate={handleLocate}
            onFilterClick={() => {
              setFilterPanelOpen(true);
            }}
          />
        </Suspense>
      </div>

      {/* Mobile: selected property panel below map */}
      {selectedPin && (
        <div className="md:hidden max-h-[45vh] overflow-y-auto border-t border-line bg-surface p-3 sm:p-4 shadow-sm">
          <div className="flex items-start gap-3">
            {selectedPin.main_image_url && (
              <NetworkImage
                alt={selectedPin.title}
                src={selectedPin.main_image_url}
                wrapperClassName="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <PriceText value={selectedPin.monthly_rent ?? 0} variant="hero" />
                  <h3 className="mt-0.5 line-clamp-1 text-h4 font-semibold text-ink sm:text-h3">{selectedPin.title}</h3>
                  {selectedPin.locality && (
                    <p className="mt-0.5 text-caption text-ink-3">{selectedPin.locality}</p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  className="shrink-0 rounded-[9px] p-1.5 text-ink-3 hover:bg-paper-2 hover:text-ink"
                  onClick={() => setSelectedPin(null)}
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 sm:mt-3 flex gap-2">
                <Button
                  size="compact"
                  fullWidth
                  onClick={() => navigate(`/listing/${selectedPin.id}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tablet & Desktop: right side panel */}
      {selectedPin && (
        <div className="hidden md:flex md:w-[320px] lg:w-[380px] xl:w-[420px] shrink-0 flex-col border-l border-line bg-surface overflow-y-auto">
          {/* Header */}
          <div className="p-4 lg:p-5 border-b border-line flex items-center justify-between sticky top-0 bg-surface z-10">
            <h2 className="text-h3 font-semibold text-ink">Property Details</h2>
            <button
              type="button"
              aria-label="Close"
              className="rounded-[9px] p-1.5 text-ink-3 hover:bg-paper-2 hover:text-ink transition-colors"
              onClick={() => setSelectedPin(null)}
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>

          {isPropertyLoading ? (
            <div className="p-4 lg:p-5 space-y-4">
              <Skeleton className="w-full aspect-[16/10] rounded-xl animate-shimmer bg-gradient-to-r" />
              <Skeleton className="h-8 w-1/2 animate-shimmer bg-gradient-to-r" />
              <Skeleton className="h-6 w-3/4 animate-shimmer bg-gradient-to-r" />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-12 animate-shimmer bg-gradient-to-r" />
                <Skeleton className="h-12 animate-shimmer bg-gradient-to-r" />
                <Skeleton className="h-12 animate-shimmer bg-gradient-to-r" />
              </div>
              <Skeleton className="h-24 w-full animate-shimmer bg-gradient-to-r" />
            </div>
          ) : fullProperty ? (
            <div className="p-4 lg:p-5 space-y-5">
              {/* Photo Gallery Carousel */}
              <div className="relative group">
                <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
                  {fullProperty.image_urls && fullProperty.image_urls.length > 0 ? (
                    fullProperty.image_urls.map((url, index) => (
                      <div key={index} className="w-full shrink-0 aspect-[16/10] snap-start overflow-hidden rounded-xl border border-line bg-paper-2">
                        <NetworkImage
                          alt={fullProperty.title}
                          src={url}
                          wrapperClassName="w-full h-full rounded-xl"
                          className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-full shrink-0 aspect-[16/10] overflow-hidden rounded-xl border border-line bg-paper-2">
                      <NetworkImage
                        alt={fullProperty.title}
                        src={fullProperty.main_image_url || selectedPin.main_image_url}
                        wrapperClassName="w-full h-full rounded-xl"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
                {/* Visual indicator for gallery swipe */}
                {fullProperty.image_urls && fullProperty.image_urls.length > 1 && (
                  <span className="absolute bottom-3 right-3 text-[9px] font-mono bg-black/60 text-white px-2 py-0.5 rounded-full pointer-events-none">
                    Swipe for more ({fullProperty.image_urls.length})
                  </span>
                )}
              </div>

              {/* Price & Title */}
              <div>
                <PriceText value={fullProperty.monthly_rent} variant="hero" className="text-accent font-serif font-normal text-2xl" />
                <h3 className="mt-1 text-h3 font-serif font-normal text-ink leading-tight">{fullProperty.title}</h3>
                {fullProperty.locality && (
                  <p className="mt-1 flex items-center gap-1.5 text-body-md text-ink-2">
                    <MapPinIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" />
                    <span className="truncate">{fullProperty.locality}{fullProperty.city ? `, ${fullProperty.city}` : ""}</span>
                  </p>
                )}
              </div>

              {/* Cost breakdown */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-line bg-paper/20 p-2.5 text-center">
                  <span className="text-[9px] uppercase font-mono tracking-wider text-ink-3 block">Rent</span>
                  <p className="text-body-md font-serif font-bold text-accent mt-0.5">{formatCurrencyINR(fullProperty.monthly_rent)}</p>
                </div>
                <div className="rounded-xl border border-line bg-paper/20 p-2.5 text-center">
                  <span className="text-[9px] uppercase font-mono tracking-wider text-ink-3 block">Deposit</span>
                  <p className="text-body-md font-serif font-bold text-ink mt-0.5">
                    {fullProperty.security_deposit ? formatCurrencyINR(fullProperty.security_deposit) : "TBD"}
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-paper/20 p-2.5 text-center">
                  <span className="text-[9px] uppercase font-mono tracking-wider text-ink-3 block">Maint.</span>
                  <p className="text-body-md font-serif font-bold text-ink mt-0.5">
                    {fullProperty.maintenance_charges ? formatCurrencyINR(fullProperty.maintenance_charges) : "None"}
                  </p>
                </div>
              </div>

              {/* Specification Chips */}
              <div className="flex flex-wrap gap-1.5">
                {fullProperty.bedrooms !== undefined && (
                  <Chip variant="info" className="bg-paper-2 border-0 text-ink-2 px-2.5 py-1 flex items-center gap-1">
                    <BedDouble aria-hidden="true" className="h-3.5 w-3.5 text-ink-3 shrink-0" />
                    <span>{fullProperty.bedrooms} BHK</span>
                  </Chip>
                )}
                {fullProperty.bathrooms !== undefined && (
                  <Chip variant="info" className="bg-paper-2 border-0 text-ink-2 px-2.5 py-1 flex items-center gap-1">
                    <Bath aria-hidden="true" className="h-3.5 w-3.5 text-ink-3 shrink-0" />
                    <span>{fullProperty.bathrooms} Bath</span>
                  </Chip>
                )}
                {fullProperty.area_sqft !== undefined && (
                  <Chip variant="info" className="bg-paper-2 border-0 text-ink-2 px-2.5 py-1 flex items-center gap-1">
                    <Ruler aria-hidden="true" className="h-3.5 w-3.5 text-ink-3 shrink-0" />
                    <span>{fullProperty.area_sqft} sqft</span>
                  </Chip>
                )}
                {fullProperty.sharing_type && (
                  <Chip variant="info" className="bg-accent-soft/30 border-0 text-accent font-semibold px-2.5 py-1 capitalize">
                    {fullProperty.sharing_type.replace("_", " ")}
                  </Chip>
                )}
                {fullProperty.gender_preference && (
                  <Chip variant="info" className="bg-paper border-0 text-ink-2 px-2.5 py-1 capitalize">
                    {fullProperty.gender_preference === "any" ? "Open to Both" : `${fullProperty.gender_preference} only`}
                  </Chip>
                )}
              </div>

              {/* Move-in availability */}
              {fullProperty.available_from && (
                <div className="flex items-center gap-2 text-body-md text-ink-2 bg-paper-2/40 px-3 py-2 rounded-xl border border-line-low">
                  <Calendar className="h-4 w-4 text-accent shrink-0" />
                  <span>Available from: <strong>{new Date(fullProperty.available_from).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></span>
                </div>
              )}

              {/* Description */}
              {fullProperty.description && (
                <div className="border-t border-line pt-3">
                  <h4 className="text-caption uppercase font-mono tracking-wider text-ink-3">About this flat</h4>
                  <p className="mt-1 text-body-md text-ink-2 leading-relaxed whitespace-pre-line">
                    {fullProperty.description}
                  </p>
                </div>
              )}

              {/* Features / Amenities */}
              {fullProperty.features && fullProperty.features.length > 0 && (
                <div className="border-t border-line pt-3">
                  <h4 className="text-caption uppercase font-mono tracking-wider text-ink-3 mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {fullProperty.features.map(f => (
                      <Chip key={f} className="bg-paper border-[0.5px] border-line px-2.5 py-1 text-caption text-ink-2 font-medium">
                        {f}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {/* Host/Owner Profile details */}
              {fullProperty.owner && (
                <div className="border-t border-line pt-4 flex items-center gap-3">
                  <div className="relative shrink-0">
                    <Avatar name={fullProperty.owner.full_name} size="sm" src={fullProperty.owner.profile_image_url} />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-surface animate-pulse" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] uppercase font-mono tracking-wider text-ink-3 leading-none block">Verified Host</span>
                    <h4 className="text-body-md font-semibold text-ink leading-tight flex items-center gap-0.5 mt-0.5">
                      {fullProperty.owner.full_name}
                      <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                    </h4>
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col gap-2 pt-2 border-t border-line">
                <Button
                  fullWidth
                  onClick={() => navigate(`/listing/${fullProperty.id}`)}
                >
                  View Details
                </Button>
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => navigate(`/chat/new?peer=${fullProperty.id}`)}
                >
                  Contact Host
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-ink-3">No details available.</div>
          )}
        </div>
      )}

      {/* Mobile & Tablet filter panel: BottomSheet */}
      <div className="md:hidden">
        <BottomSheet
          open={filterPanelOpen}
          title="Filters"
          onClose={() => setFilterPanelOpen(false)}
        >
          <FilterPanel
            sections={filterSections}
            onFilterToggle={handleFilterToggle}
            onClear={handleClearFilters}
            onApply={handleApplyFilters}
          />
        </BottomSheet>
      </div>

      {/* Desktop filter panel: Drawer from right */}
      <div className="hidden md:block">
        <Drawer
          open={filterPanelOpen}
          title="Filters"
          side="right"
          onClose={() => setFilterPanelOpen(false)}
        >
          <FilterPanel
            sections={filterSections}
            onFilterToggle={handleFilterToggle}
            onClear={handleClearFilters}
            onApply={handleApplyFilters}
          />
        </Drawer>
      </div>
    </div>
  );
}
