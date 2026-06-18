import type { HTMLAttributes } from "react";
import { MapPin } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { NetworkImage } from "../ui/NetworkImage";
import { ProgressRing } from "../ui/ProgressRing";
import { cn } from "../ui/component-utils";

export interface ProfileGridCardData {
  id: string;
  name: string;
  age?: number;
  location?: string;
  profession?: string;
  photoUrl?: string | null;
  matchScore: number;
}

export interface ProfileGridCardProps extends HTMLAttributes<HTMLElement> {
  profile: ProfileGridCardData;
  ctaLabel?: string;
  blurred?: boolean;
  onMatch?: (profileId: string) => void;
  onOpen?: (profileId: string) => void;
}

export function ProfileGridCard({
  profile,
  ctaLabel = "Match",
  blurred = false,
  onMatch,
  onOpen,
  className,
  ...props
}: ProfileGridCardProps) {
  return (
    <Card
      as="article"
      interactive={Boolean(onOpen)}
      className={cn("min-w-0", className)}
      onClick={() => onOpen?.(profile.id)}
      {...props}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
        <NetworkImage
          alt={profile.name}
          src={profile.photoUrl}
          wrapperClassName={cn("h-full w-full rounded-2xl", blurred && "blur-sm")}
        />
        <div className="absolute right-2 top-2 rounded-full bg-surface p-1 shadow-xs">
          <ProgressRing size="md" value={profile.matchScore} label="Compatibility score" />
        </div>
      </div>
      <div className="mt-3 min-w-0">
        <h3 className="truncate text-body-md font-bold text-ink">{profile.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-caption text-ink-2">
          {profile.age ? <span>{profile.age}</span> : null}
          {profile.age && profile.location ? <span aria-hidden="true">·</span> : null}
          {profile.location ? (
            <>
              <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-accent" />
              <span className="truncate">{profile.location}</span>
            </>
          ) : null}
        </p>
        {profile.profession ? <p className="mt-1 truncate text-caption text-ink-3">{profile.profession}</p> : null}
      </div>
      <Button
        className="mt-3 min-h-[42px] animate-scale-in"
        fullWidth
        size="compact"
        onClick={(event) => {
          event.stopPropagation();
          onMatch?.(profile.id);
        }}
      >
        {ctaLabel}
      </Button>
    </Card>
  );
}

