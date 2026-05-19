import type { HTMLAttributes, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../ui/component-utils";

export interface FeedSectionProps extends HTMLAttributes<HTMLElement> {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}

export function FeedSection({
  title,
  actionLabel,
  onAction,
  children,
  className,
  ...props
}: FeedSectionProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)} {...props}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-h3 font-semibold text-ink">{title}</h2>
        {actionLabel ? (
          <Button
            size="compact"
            trailingIcon={<ChevronRight aria-hidden="true" className="h-4 w-4" />}
            variant="tertiary"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        ) : null}
      </div>
      <div className="flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth w-auto -mx-5 px-5 md:-mx-6 md:px-6">
        {children}
      </div>
    </section>
  );
}

