import type { HTMLAttributes } from "react";
import { LocateFixed, MapPin, Minus, Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/Button";
import { Chip } from "../ui/Chip";
import { EmptyState } from "../ui/StateViews";
import { ListingMiniCard } from "../molecules/MiniCards";
import { cn } from "../ui/component-utils";

export interface MapPinData {
  id: string;
  title: string;
  price: number;
  locality?: string;
  imageUrl?: string | null;
  compatibilityScore?: number;
}

export interface MapExplorerProps extends HTMLAttributes<HTMLElement> {
  pins: MapPinData[];
  filters?: string[];
  onFilterClick?: () => void;
  onPinSelect?: (pinId: string) => void;
  onLocate?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export function MapExplorer({
  pins,
  filters = [],
  onFilterClick,
  onPinSelect,
  onLocate,
  onZoomIn,
  onZoomOut,
  className,
  ...props
}: MapExplorerProps) {
  return (
    <section className={cn("relative flex min-h-[400px] md:min-h-[640px] flex-col overflow-hidden rounded-2xl border border-line bg-paper-2", className)} {...props}>
      <div className="z-10 flex min-h-14 items-center gap-2 border-b border-line bg-surface px-3">
        <div className="flex flex-1 gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <Chip key={filter} selected variant="filter">
              {filter}
            </Chip>
          ))}
        </div>
        <Button
          leadingIcon={<SlidersHorizontal aria-hidden="true" className="h-4 w-4" />}
          size="compact"
          variant="secondary"
          onClick={onFilterClick}
        >
          Filters
        </Button>
      </div>
      <div className="relative flex flex-1 items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-paper-3)_1px,transparent_1px)] [background-size:24px_24px]" />
        {pins.length === 0 ? (
          <EmptyState title="No map results" description="Adjust filters to see listings on the map." />
        ) : (
          <div className="relative z-10 grid w-full max-w-lg gap-3 p-4">
            {pins.slice(0, 4).map((pin) => (
              <button
                type="button"
                className="rounded-2xl border border-line bg-surface p-3 text-left shadow-sm hover:shadow-hover"
                key={pin.id}
                onClick={() => onPinSelect?.(pin.id)}
              >
                <ListingMiniCard
                  imageUrl={pin.imageUrl}
                  locality={pin.locality}
                  price={pin.price}
                  title={pin.title}
                />
                {pin.compatibilityScore !== undefined ? (
                  <p className="mt-2 flex items-center gap-1 text-caption text-success">
                    <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                    {pin.compatibilityScore}% compatibility
                  </p>
                ) : null}
              </button>
            ))}
          </div>
        )}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
          <Button aria-label="Zoom in" size="icon" variant="secondary" onClick={onZoomIn}>
            <Plus aria-hidden="true" className="h-5 w-5" />
          </Button>
          <Button aria-label="Zoom out" size="icon" variant="secondary" onClick={onZoomOut}>
            <Minus aria-hidden="true" className="h-5 w-5" />
          </Button>
          <Button aria-label="Locate me" size="icon" onClick={onLocate}>
            <LocateFixed aria-hidden="true" className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

