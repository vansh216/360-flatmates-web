import type { HTMLAttributes } from "react";
import { cn } from "./component-utils";

export type SkeletonVariant = "block" | "card" | "listItem" | "feed" | "profile";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  count?: number;
}

const shimmerClass =
  "animate-shimmer bg-gradient-to-r from-paper-2 via-surface to-paper-2 motion-reduce:animate-none";

function BlockSkeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("h-4 rounded-full", shimmerClass, className)} />;
}

function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("h-10 w-10 rounded-full", shimmerClass)} />
      <div className="flex flex-1 flex-col gap-2">
        <BlockSkeleton className="w-3/5" />
        <BlockSkeleton className="h-3 w-2/5" />
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className={cn("aspect-[16/10] rounded-2xl", shimmerClass)} />
      <div className="mt-4 flex flex-col gap-2">
        <BlockSkeleton className="h-5 w-2/5" />
        <BlockSkeleton className="w-4/5" />
        <BlockSkeleton className="w-3/5" />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className={cn("h-20 w-20 rounded-full", shimmerClass)} />
      <BlockSkeleton className="h-5 w-1/2" />
      <BlockSkeleton className="w-1/3" />
    </div>
  );
}

export function Skeleton({ variant = "block", count = 1, className, ...props }: SkeletonProps) {
  const items = Array.from({ length: count }, (_, index) => index);

  if (variant === "feed") {
    return (
      <div className={cn("flex flex-col gap-3", className)} {...props}>
        {items.map((item) => (
          <CardSkeleton key={item} />
        ))}
      </div>
    );
  }

  return (
    <div className={className} {...props}>
      {items.map((item) => {
        if (variant === "card") {
          return <CardSkeleton key={item} />;
        }

        if (variant === "listItem") {
          return <ListItemSkeleton key={item} />;
        }

        if (variant === "profile") {
          return <ProfileSkeleton key={item} />;
        }

        return <BlockSkeleton key={item} />;
      })}
    </div>
  );
}

