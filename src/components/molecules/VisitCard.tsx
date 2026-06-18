import type { HTMLAttributes } from "react";
import { CalendarDays } from "lucide-react";
import { Badge, type StatusTone } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { NetworkImage } from "../ui/NetworkImage";
import { cn } from "../ui/component-utils";
import { formatDateTime } from "@/lib/utils/format";

export type VisitStatus = "confirmed" | "pending" | "completed" | "cancelled";
export type VisitType = "Property Tour" | "Flatmate Meet";

export interface VisitCardData {
  id: string;
  propertyTitle: string;
  propertyImageUrl?: string | null;
  type: VisitType;
  /** ISO date-time string from the API. */
  dateTime: string;
  status: VisitStatus;
}

const STATUS_LABEL: Record<VisitStatus, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled"
};

/** Format an ISO date-time into a friendly label, falling back to the raw value. */
function formatVisitDateTime(value: string): string {
  if (!value) return "Date to be confirmed";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return formatDateTime(parsed);
}

export interface VisitCardProps extends HTMLAttributes<HTMLElement> {
  visit: VisitCardData;
  canConfirm?: boolean;
  /** Disables inline action buttons and shows a busy state (e.g. mutation in flight). */
  busy?: boolean;
  onConfirm?: (visitId: string) => void;
  onReschedule?: (visitId: string) => void;
  onCancel?: (visitId: string) => void;
  onRate?: (visitId: string) => void;
}

const statusMap: Record<VisitStatus, StatusTone> = {
  confirmed: "confirmed",
  pending: "pending",
  completed: "completed",
  cancelled: "cancelled"
};

export function VisitCard({
  visit,
  canConfirm = false,
  busy = false,
  onConfirm,
  onReschedule,
  onCancel,
  onRate,
  className,
  ...props
}: VisitCardProps) {
  const dateLabel = formatVisitDateTime(visit.dateTime);

  return (
    <Card as="article" className={cn("flex gap-3", className)} {...props}>
      <NetworkImage
        alt={visit.propertyTitle}
        src={visit.propertyImageUrl}
        wrapperClassName="h-14 w-14 shrink-0 rounded-xl"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-body-md font-semibold text-ink">{visit.propertyTitle}</h3>
          <Badge tone={visit.type === "Property Tour" ? "teal" : "purple"}>{visit.type}</Badge>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-ink-2">
          <CalendarDays aria-hidden="true" className="h-4 w-4 text-accent" />
          <time dateTime={visit.dateTime || undefined}>{dateLabel}</time>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge status={statusMap[visit.status]} variant="status">
            {STATUS_LABEL[visit.status]}
          </Badge>
          {visit.status === "pending" && canConfirm ? (
            <Button size="compact" disabled={busy} onClick={() => onConfirm?.(visit.id)}>
              Confirm
            </Button>
          ) : null}
          {visit.status === "confirmed" || visit.status === "pending" ? (
            <>
              <Button size="compact" variant="tertiary" disabled={busy} onClick={() => onReschedule?.(visit.id)}>
                Reschedule
              </Button>
              <Button size="compact" variant="tertiary" disabled={busy} onClick={() => onCancel?.(visit.id)}>
                Cancel
              </Button>
            </>
          ) : null}
          {visit.status === "completed" ? (
            <Button size="compact" variant="tertiary" disabled={busy} onClick={() => onRate?.(visit.id)}>
              Rate
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

