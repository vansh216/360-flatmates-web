import type { InputHTMLAttributes, ReactNode } from "react";
import { Search, X } from "lucide-react";
import { cn, focusRing, interactiveMotion } from "./component-utils";

export interface SearchBarProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  onClear?: () => void;
  recentSearches?: string[];
  showRecentSearches?: boolean;
  onRecentSearchSelect?: (query: string) => void;
  onClearHistory?: () => void;
}

export function SearchBar({
  leadingIcon,
  trailingIcon,
  onClear,
  recentSearches = [],
  showRecentSearches = false,
  onRecentSearchSelect,
  onClearHistory,
  className,
  value,
  defaultValue,
  disabled,
  placeholder = "Search listings, localities, or flatmates",
  ...props
}: SearchBarProps) {
  const rawValue = value ?? defaultValue;
  const hasValue = typeof rawValue === "string" && rawValue.length > 0;

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "group flex h-12 items-center gap-2 rounded-[9px] border border-line bg-surface px-3 text-ink shadow-xs focus-within:scale-[1.01] focus-within:border-accent/50 focus-within:shadow-focus hover:border-accent/30",
          interactiveMotion,
          disabled && "bg-paper-4 text-ink-3",
          className
        )}
      >
        <span className="text-ink-3 group-focus-within:text-accent">
          {leadingIcon ?? <Search aria-hidden="true" className="h-5 w-5" />}
        </span>
        <input
          type="search"
          className={cn(
            "min-w-0 flex-1 bg-transparent text-body-md text-ink outline-none placeholder:text-ink-3 disabled:cursor-not-allowed",
            focusRing
          )}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          {...props}
        />
        {hasValue && onClear ? (
          <button
            type="button"
            aria-label="Clear search"
            className={cn("rounded-[9px] p-1 text-ink-3 hover:bg-paper-2 hover:text-ink", focusRing)}
            onClick={onClear}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        ) : (
          trailingIcon
        )}
      </div>
      {showRecentSearches && recentSearches.length > 0 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-lg border border-line bg-surface p-2 shadow-md">
          <div className="flex flex-col">
            {recentSearches.slice(0, 5).map((query) => (
              <button
                type="button"
                className="rounded-[9px] px-3 py-2 text-left text-body-md text-ink hover:bg-accent-soft"
                key={query}
                onClick={() => onRecentSearchSelect?.(query)}
              >
                {query}
              </button>
            ))}
          </div>
          {onClearHistory ? (
            <button
              type="button"
              className="mt-1 rounded-[9px] px-3 py-2 text-caption font-semibold text-accent hover:bg-accent-soft"
              onClick={onClearHistory}
            >
              Clear history
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

