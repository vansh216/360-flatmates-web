import type { HTMLAttributes } from "react";
import { Bath, BedDouble, Heart, MapPin, Maximize2, Users } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Chip } from "../ui/Chip";
import { NetworkImage } from "../ui/NetworkImage";
import { PriceText } from "../ui/PriceText";
import { ProgressRing } from "../ui/ProgressRing";
import { cn } from "../ui/component-utils";
import { formatLocation } from "@/lib/utils";

export interface ListingCardData {
  id: string;
  title: string;
  price: number;
  imageUrl?: string | null;
  locality: string;
  city?: string;
  beds?: number;
  baths?: number;
  areaSqFt?: number;
  features?: string[];
  owner?: {
    name: string;
    avatarUrl?: string | null;
  };
  interestCount?: number;
  description?: string;
  compatibilityScore?: number;
}

export interface ListingCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  listing: ListingCardData;
  saved?: boolean;
  ctaLabel?: string;
  onSave?: (listingId: string) => void;
  onContact?: (listingId: string) => void;
  onOpen?: (listingId: string) => void;
}

export function ListingCard({
  listing,
  saved = false,
  ctaLabel = "Contact",
  onSave,
  onContact,
  onOpen,
  className,
  ...props
}: ListingCardProps) {
  const location = formatLocation(listing.locality, listing.city);

  return (
    <Card
      as="article"
      interactive={Boolean(onOpen)}
      className={cn("grid gap-3 lg:grid-cols-[148px_minmax(0,1fr)]", className)}
      onClick={() => onOpen?.(listing.id)}
      {...props}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl md:aspect-[0.82]">
        <NetworkImage
          alt={listing.title}
          src={listing.imageUrl}
          wrapperClassName="h-full w-full rounded-2xl"
        />
        <button
          type="button"
          aria-label={saved ? "Remove saved listing" : "Save listing"}
          className={cn(
            "absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-xs transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            saved && "text-accent"
          )}
          onClick={(event) => {
            event.stopPropagation();
            onSave?.(listing.id);
          }}
        >
          <Heart aria-hidden="true" className={cn("h-5 w-5", saved && "fill-current")} />
        </button>
        {listing.compatibilityScore !== undefined ? (
          <div className="absolute bottom-2 right-2 rounded-full bg-surface p-1 shadow-xs">
            <ProgressRing value={listing.compatibilityScore} />
          </div>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <PriceText value={listing.price} variant="hero" />
            <h3 className="mt-1 line-clamp-1 text-h3 font-semibold text-ink">{listing.title}</h3>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-body-md text-ink-2">
          <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" />
          <span className="truncate">{location}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {listing.beds !== undefined ? (
            <Chip aria-label={`${listing.beds} beds`} variant="info">
              <BedDouble aria-hidden="true" className="h-3.5 w-3.5" />
              {listing.beds} bed
            </Chip>
          ) : null}
          {listing.baths !== undefined ? (
            <Chip aria-label={`${listing.baths} baths`} variant="info">
              <Bath aria-hidden="true" className="h-3.5 w-3.5" />
              {listing.baths} bath
            </Chip>
          ) : null}
          {listing.areaSqFt !== undefined ? (
            <Chip aria-label={`${listing.areaSqFt} square feet`} variant="info">
              <Maximize2 aria-hidden="true" className="h-3.5 w-3.5" />
              {listing.areaSqFt} sq ft
            </Chip>
          ) : null}
        </div>
        {listing.features && listing.features.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {listing.features.slice(0, 3).map((feature) => (
              <Chip key={feature} variant="info">
                {feature}
              </Chip>
            ))}
          </div>
        ) : null}
        {listing.description ? (
          <p className="line-clamp-2 text-body-md text-ink-2">{listing.description}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3">
          {listing.owner ? (
            <div className="flex min-w-0 items-center gap-2">
              <Avatar name={listing.owner.name} size="compact" src={listing.owner.avatarUrl} />
              <div className="min-w-0">
                <p className="truncate text-caption font-semibold text-ink">{listing.owner.name}</p>
                {listing.interestCount !== undefined ? (
                  <p className="flex items-center gap-1 text-caption text-ink-3">
                    <Users aria-hidden="true" className="h-3.5 w-3.5" />
                    {listing.interestCount} interested
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <span />
          )}
          <Button
            size="compact"
            onClick={(event) => {
              event.stopPropagation();
              onContact?.(listing.id);
            }}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
}

