import { useMemo, useCallback, useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router";
import { useQueryStates } from "nuqs";
import { SeoHelmet, SITE_URL, buildBreadcrumbJsonLd, homeBreadcrumb } from "@/lib/seo";
import { Search, SlidersHorizontal, Map as MapIcon, List as ListIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { useWebSearch } from "@/hooks/queries/useSearch";
import { useAmenities, useCities } from "@/hooks/queries/useCatalogs";
import { propertyToListingCardProps } from "@/lib/api/adapters";
import type { SearchFilters, Property, MapPin } from "@/lib/api/types";
import { searchPageParams } from "@/lib/schemas/search-params";
import { searchStore } from "@/lib/stores/search-store";
import { type FilterSection, FilterPanel } from "@/components/molecules/FilterPanel";
import { type ListingCardData, ListingCard } from "@/components/molecules/ListingCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/StateViews";
import { BottomSheet } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/components/ui/component-utils";

const MapView = lazy(
  () => import("@/components/organisms/MapView").then((mod) => ({ default: mod.MapView }))
);

const breadcrumbLd = buildBreadcrumbJsonLd([
  homeBreadcrumb(),
  { name: "Search", item: `${SITE_URL}/search` },
]);

export function SearchPage() {
  const navigate = useNavigate();

  const [params, setParams] = useQueryStates(searchPageParams, {
    history: "replace",
    shallow: true,
  });

  const PAGE_SIZE = 20;

  const { data: cities } = useCities();
  const { data: amenities } = useAmenities();

  const [prevQ, setPrevQ] = useState(params.q);
  const [localSearch, setLocalSearch] = useState(params.q || "");

  if (params.q !== prevQ) {
    setPrevQ(params.q);
    setLocalSearch(params.q || "");
  }

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const filters: SearchFilters = useMemo(
    () => ({
      q: params.q || undefined,
      city: cities?.find((c) => c.id === params.city)?.name,
      bedrooms_min: params.bedrooms ? Number(params.bedrooms) : undefined,
      amenities: params.amenities.length > 0 ? params.amenities : undefined,
      price_min: params.priceMin ?? undefined,
      price_max: params.priceMax ?? undefined,
      limit: PAGE_SIZE,
      page: params.page,
    }),
    [params.q, params.city, params.bedrooms, params.amenities, params.priceMin, params.priceMax, params.page, cities]
  );

  const {
    data: searchResults,
    isLoading,
    refetch,
  } = useWebSearch(filters);

  useEffect(() => {
    searchStore.getState().setFilters(filters);
  }, [filters]);

  const totalPages = searchResults?.total_pages ?? 1;
  const currentPage = params.page;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const listings: ListingCardData[] = useMemo(() => {
    if (!searchResults?.results) return [];
    return searchResults.results
      .filter(
        (r): r is Extract<typeof r, { property_type: unknown }> =>
          "property_type" in (r as unknown as Record<string, unknown>)
      )
      .map((r) =>
        propertyToListingCardProps(
          r as Parameters<typeof propertyToListingCardProps>[0]
        )
      );
  }, [searchResults]);

  const mapPins = useMemo(() => {
    if (!searchResults?.results) return [];
    return (searchResults.results as Property[])
      .filter((p) => p.latitude !== undefined && p.longitude !== undefined)
      .map((p) => ({
        id: p.id,
        lat: p.latitude!,
        lng: p.longitude!,
        title: p.title,
        locality: p.locality,
        monthly_rent: p.monthly_rent,
        main_image_url: p.main_image_url,
        is_available: p.is_available,
        sharing_type: p.sharing_type,
      }));
  }, [searchResults]);

  const [prevPins, setPrevPins] = useState(mapPins);
  const [mapCenter, setMapCenter] = useState<[number, number]>(() => {
    if (mapPins.length > 0 && mapPins[0].lat && mapPins[0].lng) {
      return [mapPins[0].lat, mapPins[0].lng];
    }
    return [28.6139, 77.2090];
  });
  const [mapZoom, setMapZoom] = useState(11);

  if (mapPins !== prevPins) {
    setPrevPins(mapPins);
    if (mapPins.length > 0 && mapPins[0].lat && mapPins[0].lng) {
      setMapCenter([mapPins[0].lat, mapPins[0].lng]);
      setMapZoom(12);
    }
  }

  const filterSections: FilterSection[] = useMemo(
    () => [
      {
        id: "city",
        title: "City",
        options:
          cities?.map((c) => ({
            value: String(c.id),
            label: c.name,
            selected: c.id === params.city,
          })) ?? [],
      },
      {
        id: "bedrooms",
        title: "Bedrooms",
        options: ["1", "2", "3", "4+"].map((b) => ({
          value: b,
          label: `${b} BHK`,
          selected: params.bedrooms === b,
        })),
      },
      ...(amenities
        ? [
            {
              id: "amenities",
              title: "Amenities",
              options: amenities.slice(0, 10).map((a) => ({
                value: a.name,
                label: a.name,
                selected: params.amenities.includes(a.name),
              })),
            },
          ]
        : []),
    ],
    [cities, params.city, params.bedrooms, amenities, params.amenities]
  );

  const handleFilterToggle = useCallback(
    (sectionId: string, value: string) => {
      if (sectionId === "city") {
        setParams({ city: Number(value), page: 1 });
      } else if (sectionId === "bedrooms") {
        setParams({
          bedrooms: params.bedrooms === value ? "" : value,
          page: 1,
        });
      } else if (sectionId === "amenities") {
        const next = params.amenities.includes(value)
          ? params.amenities.filter((a) => a !== value)
          : [...params.amenities, value];
        setParams({ amenities: next, page: 1 });
      }
    },
    [params.bedrooms, params.amenities, setParams]
  );

  const handleClearFilters = useCallback(() => {
    setParams(null);
    setLocalSearch("");
  }, [setParams]);

  const handlePageChange = useCallback(
    (page: number) => {
      setParams({ page });
      const scrollContainer = document.getElementById("listings-scroll-container");
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [setParams]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams({ q: localSearch, page: 1 });
  };

  const handleViewportChange = useCallback((bounds: unknown, zoom: number) => {
    setMapZoom(zoom);
  }, []);

  const handlePinSelect = useCallback((pin: MapPin) => {
    setViewMode("list");
    const cardEl = document.getElementById(`listing-card-${pin.id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
      cardEl.classList.add("ring-2", "ring-accent", "ring-offset-2");
      setTimeout(() => {
        cardEl.classList.remove("ring-2", "ring-accent", "ring-offset-2");
      }, 2000);
    }
  }, []);

  return (
    <>
      <SeoHelmet
        title="Search Flatmates & Rooms"
        description="Search for compatible flatmates and verified rental listings across Indian cities by budget, location, amenities, and lifestyle preferences."
        canonicalUrl={`${SITE_URL}/search`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      </SeoHelmet>
      
      <main id="main" className="page-fade mx-auto max-w-7xl px-4 py-6 md:px-6">
        {/* Title Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-display font-serif font-normal text-3xl leading-none text-ink">Search Listings</h1>
            <p className="text-body-md text-ink-3 mt-1">Find verified properties by query, budget, city, or configuration.</p>
          </div>
          <Button
            variant="secondary"
            size="compact"
            onClick={() => navigate("/saved-searches")}
            className="self-start md:self-auto rounded-xl"
          >
            Saved Searches
          </Button>
        </div>

        {/* Unified Search & Quick Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 border border-line bg-surface p-3 rounded-2xl mb-6 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-3 pointer-events-none" />
            <input
              type="search"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by city, locality, or keyword (e.g. 1BHK, WiFi)..."
              className="w-full rounded-xl border border-line bg-surface py-2 pl-10 pr-4 text-body-md text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {/* City Dropdown */}
            <select
              value={params.city}
              onChange={(e) => setParams({ city: Number(e.target.value), page: 1 })}
              className="h-9 rounded-xl border border-line bg-surface px-3 text-body-sm font-semibold text-ink-2 focus:border-accent focus:outline-none cursor-pointer"
            >
              <option value={0}>All Cities</option>
              {cities?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Bedrooms Dropdown */}
            <select
              value={params.bedrooms}
              onChange={(e) => setParams({ bedrooms: e.target.value, page: 1 })}
              className="h-9 rounded-xl border border-line bg-surface px-3 text-body-sm font-semibold text-ink-2 focus:border-accent focus:outline-none cursor-pointer"
            >
              <option value="">All BHKs</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4+">4+ BHK</option>
            </select>

            {/* Amenities dialog button */}
            <Button
              variant="secondary"
              size="compact"
              className="h-9 rounded-xl border-line text-body-sm font-semibold text-ink-2"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              Filters {params.amenities.length > 0 ? `(${params.amenities.length})` : ""}
            </Button>

            {/* Clear Filters */}
            {(params.q || params.city !== 0 || params.bedrooms || params.amenities.length > 0) && (
              <Button
                variant="icon"
                size="compact"
                className="text-body-sm text-accent hover:text-accent font-semibold px-2"
                onClick={handleClearFilters}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Split Screen Container */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1.2fr_1fr] border border-line rounded-2xl bg-surface shadow-sm overflow-hidden h-[calc(100vh-18rem)] min-h-[480px] lg:h-[calc(100vh-15rem)] lg:min-h-[550px] relative">
          
          {/* Left Column: Listings list */}
          <div className={cn(
            "flex flex-col min-w-0 h-full",
            viewMode === "map" ? "hidden lg:flex" : "flex"
          )}>
            <div className="flex items-center justify-between border-b border-line px-5 py-3 bg-paper-2/30 shrink-0">
              <span className="text-eyebrow text-ink-3 tracking-widest uppercase">
                {isLoading ? (
                  <Skeleton className="h-4 w-28" />
                ) : (
                  `${searchResults?.total ?? listings.length} results found`
                )}
              </span>
              <button
                onClick={() => navigate("/saved-searches")}
                className="text-body-sm font-semibold text-accent hover:underline"
              >
                Save search
              </button>
            </div>

            {/* Scrolling list */}
            <div id="listings-scroll-container" className="flex-1 overflow-y-auto p-4 md:p-6 bg-paper-2/10">
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} variant="listingCard" />
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <EmptyState
                  title="No results found"
                  description="Try clearing your filters or refining your search query."
                  actionLabel="Clear Filters"
                  onAction={handleClearFilters}
                />
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {listings.map((listing, index) => (
                    <div
                      key={listing.id}
                      id={`listing-card-${listing.id}`}
                      className="card-appear transition-all duration-300 rounded-2xl"
                      style={{ animationDelay: `${Math.min(index, 5) * 50}ms` }}
                    >
                      <ListingCard
                        listing={listing}
                        ctaLabel="View Details"
                        onOpen={(id) => navigate(`/listing/${id}`)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination footer */}
            {!isLoading && totalPages > 1 && (
              <div className="border-t border-line px-5 py-3 bg-paper-2/30 shrink-0 flex items-center justify-between gap-2">
                <Button
                  leadingIcon={<ChevronLeft aria-hidden="true" className="h-4 w-4" />}
                  variant="secondary"
                  size="compact"
                  disabled={!hasPrev}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="rounded-xl"
                >
                  Prev
                </Button>
                <span className="text-body-sm font-medium text-ink-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  trailingIcon={<ChevronRight aria-hidden="true" className="h-4 w-4" />}
                  variant="secondary"
                  size="compact"
                  disabled={!hasNext}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="rounded-xl"
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Leaflet Map */}
          <div className={cn(
            "relative h-full border-t lg:border-t-0 lg:border-l border-line min-h-[400px] lg:min-h-0",
            viewMode === "list" ? "hidden lg:block" : "block"
          )}>
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-paper-2/30 backdrop-blur-[2px]">
                <Spinner size="md" />
              </div>
            )}
            <Suspense fallback={
              <div className="flex h-full items-center justify-center bg-paper-2">
                <Spinner size="md" />
              </div>
            }>
              <MapView
                clusters={[]}
                pins={isLoading ? [] : mapPins}
                center={mapCenter}
                zoom={mapZoom}
                onPinSelect={handlePinSelect}
                onViewportChange={handleViewportChange}
              />
            </Suspense>
          </div>
        </div>

        {/* Mobile Toggle floating button */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <Button
            onClick={() => setViewMode((prev) => (prev === "list" ? "map" : "list"))}
            className="rounded-full shadow-lg font-semibold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all bg-ink text-surface px-5 py-2.5"
          >
            {viewMode === "list" ? (
              <>
                <MapIcon className="h-4.5 w-4.5" />
                <span>Show Map</span>
              </>
            ) : (
              <>
                <ListIcon className="h-4.5 w-4.5" />
                <span>Show List</span>
              </>
            )}
          </Button>
        </div>
      </main>

      {/* Filter panel drawer */}
      <BottomSheet
        open={mobileFiltersOpen}
        title="All Filters"
        onClose={() => setMobileFiltersOpen(false)}
      >
        <div className="max-h-[70vh] overflow-y-auto px-4 pb-6">
          <FilterPanel
            sections={filterSections}
            onFilterToggle={handleFilterToggle}
            onClear={handleClearFilters}
            onApply={() => {
              setParams({ page: 1 });
              refetch();
              setMobileFiltersOpen(false);
            }}
          />
        </div>
      </BottomSheet>
    </>
  );
}

