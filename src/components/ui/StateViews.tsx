import type { ReactNode } from "react";
import { AlertTriangle, Search } from "lucide-react";
import { Button } from "./Button";
import { cn } from "./component-utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl p-6 text-center animate-fade-slide-up", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent animate-breathe">
        {icon ?? <Search aria-hidden="true" className="h-6 w-6" />}
      </div>
      <div className="max-w-[34rem]">
        <h3 className="text-h3 font-semibold text-ink">{title}</h3>
        {description ? <p className="mt-1 text-body-md text-ink-2">{description}</p> : null}
      </div>
      {actionLabel && onAction ? (
        <Button size="compact" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
  icon?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  actionLabel = "Try Again",
  onRetry,
  icon,
  className
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl p-6 text-center animate-fade-slide-up", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-soft text-error">
        {icon ?? <AlertTriangle aria-hidden="true" className="h-6 w-6" />}
      </div>
      <div className="max-w-[34rem]">
        <h3 className="text-h3 font-semibold text-ink">{title}</h3>
        {description ? <p className="mt-1 text-body-md text-ink-2">{description}</p> : null}
      </div>
      {onRetry ? (
        <Button size="compact" onClick={onRetry}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export interface AsyncViewProps<T> {
  data: T | null | undefined;
  isLoading?: boolean;
  error?: Error | null;
  loading?: ReactNode;
  empty?: ReactNode;
  errorView?: ReactNode;
  isEmpty?: (data: T) => boolean;
  onRetry?: () => void;
  children: (data: T) => ReactNode;
}

export function AsyncView<T>({
  data,
  isLoading = false,
  error,
  loading,
  empty,
  errorView,
  isEmpty,
  onRetry,
  children
}: AsyncViewProps<T>) {
  if (isLoading) {
    return <>{loading}</>;
  }

  if (error) {
    return <>{errorView ?? <ErrorState onRetry={onRetry} />}</>;
  }

  if (data === null || data === undefined || (isEmpty && isEmpty(data))) {
    return <>{empty ?? <EmptyState title="Nothing here yet" />}</>;
  }

  return <>{children(data)}</>;
}

