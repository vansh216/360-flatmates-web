import type { HTMLAttributes } from "react";
import { CheckCircle2, Lock, Shield, ShieldCheck } from "lucide-react";
import { cn, toneClasses, type Tone } from "./component-utils";

export type TrustBadgeVariant = "verified" | "reviewed" | "safe" | "privacy";

export interface TrustBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TrustBadgeVariant;
  label?: string;
}

const config: Record<TrustBadgeVariant, { label: string; tone: Tone; icon: React.ElementType }> = {
  verified: { label: "Verified", tone: "success", icon: CheckCircle2 },
  reviewed: { label: "Reviewed", tone: "accent", icon: ShieldCheck },
  safe: { label: "Safe", tone: "teal", icon: Shield },
  privacy: { label: "Private", tone: "accent", icon: Lock }
};

export function TrustBadge({ variant = "verified", label, className, ...props }: TrustBadgeProps) {
  const item = config[variant];
  const Icon = item.icon;
  const classes = toneClasses[item.tone];

  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-1 text-label-md font-semibold",
        classes.soft,
        classes.text,
        classes.border,
        className
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      {label ?? item.label}
    </span>
  );
}

