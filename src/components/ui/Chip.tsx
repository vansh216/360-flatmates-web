import type { ButtonHTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";
import { cn, focusRing } from "./component-utils";

export type ChipVariant = "filter" | "choice" | "info" | "removable";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ChipVariant;
  selected?: boolean;
  icon?: ReactNode;
  onRemove?: () => void;
}

const sizeClasses: Record<ChipVariant, string> = {
  filter: "px-3.5 py-2 text-label-md",
  choice: "px-3.5 py-2 text-label-md",
  info: "px-2.5 py-1.5 text-caption",
  removable: "px-3.5 py-2 text-label-md"
};

export function Chip({
  variant = "filter",
  selected = false,
  icon,
  onRemove,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ChipProps) {
  const role = props.role ?? (variant === "choice" ? "radio" : "checkbox");
  const isRemovable = variant === "removable" && onRemove;

  // For removable chips, use a div wrapper to avoid nesting interactive elements
  if (isRemovable) {
    return (
      <div
        className={cn(
          "inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border font-semibold",
          selected
            ? "scale-[1.03] border-accent bg-accent-container text-accent"
            : "border-line bg-paper-2 text-ink-2 hover:bg-paper-3",
          sizeClasses[variant],
          className
        )}
      >
        <button
          type={type}
          role={role}
          aria-checked={props["aria-checked"] ?? selected}
          disabled={disabled}
          className={cn(
            "flex-1 cursor-pointer rounded-full text-center focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
            "active:scale-[0.97] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-paper-4 disabled:text-ink-3"
          )}
          {...props}
        >
          {icon ? <span className="flex h-4 w-4 items-center justify-center">{icon}</span> : null}
          <span className="truncate">{children}</span>
        </button>
        <button
          type="button"
          aria-label="Remove"
          className={cn(
            "mr-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-current hover:bg-paper-3 active:scale-[0.97]",
            focusRing
          )}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type={type}
      role={role}
      aria-checked={props["aria-checked"] ?? selected}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border font-semibold active:scale-[0.97] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-paper-4 disabled:text-ink-3",
        "chip-spring",
        focusRing,
        selected
          ? "scale-[1.03] border-accent bg-accent-container text-accent"
          : "border-line bg-paper-2 text-ink-2 hover:bg-paper-3",
        variant === "info" && selected && "bg-accent-soft",
        sizeClasses[variant],
        className
      )}
      {...props}
    >
      {icon ? <span className="flex h-4 w-4 items-center justify-center">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </button>
  );
}

