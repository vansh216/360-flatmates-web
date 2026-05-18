import type { HTMLAttributes, ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { cn } from "../ui/component-utils";

export interface DashboardMetric {
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
  helper?: string;
}

export interface ListingPerformanceRow {
  id: string;
  title: string;
  views: number;
  likes: number;
  conversations: number;
  visits: number;
  boostStatus: "active" | "inactive" | "expired";
}

export interface DashboardPanelProps extends HTMLAttributes<HTMLElement> {
  metrics: DashboardMetric[];
  rows: ListingPerformanceRow[];
  chart?: ReactNode;
  onViewAnalytics?: (listingId: string) => void;
  onBoost?: (listingId: string) => void;
  onEdit?: (listingId: string) => void;
}

const boostTone: Record<ListingPerformanceRow["boostStatus"], "success" | "neutral" | "warning"> = {
  active: "success",
  inactive: "neutral",
  expired: "warning"
};

export function DashboardPanel({
  metrics,
  rows,
  chart,
  onViewAnalytics,
  onBoost,
  onEdit,
  className,
  ...props
}: DashboardPanelProps) {
  return (
    <section className={cn("mx-auto flex w-full max-w-[1200px] flex-col gap-5", className)} {...props}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card className="p-5" key={metric.label} variant="compact">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-caption text-ink-3">{metric.label}</p>
                <p className="mt-2 text-h2 font-normal text-ink">{metric.value}</p>
              </div>
              {metric.trend === "up" ? <ArrowUpRight aria-hidden="true" className="h-5 w-5 text-success" /> : null}
              {metric.trend === "down" ? <ArrowDownRight aria-hidden="true" className="h-5 w-5 text-error" /> : null}
            </div>
            {metric.helper ? <p className="mt-2 text-caption text-ink-3">{metric.helper}</p> : null}
          </Card>
        ))}
      </div>
      <Card className="min-h-[300px]">
        {chart ?? (
          <div className="flex h-[260px] items-center justify-center rounded-xl bg-paper-2 text-body-md text-ink-3">
            Chart area
          </div>
        )}
      </Card>
      {/* Desktop table view */}
      <Card className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line text-caption uppercase tracking-[0.16em] text-ink-3">
              <th className="py-3 pr-4">Listing</th>
              <th className="py-3 pr-4">Views</th>
              <th className="py-3 pr-4">Likes</th>
              <th className="py-3 pr-4">Chats</th>
              <th className="py-3 pr-4">Visits</th>
              <th className="py-3 pr-4">Boost</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-line last:border-b-0" key={row.id}>
                <td className="py-3 pr-4 text-body-md font-semibold text-ink">{row.title}</td>
                <td className="py-3 pr-4 text-body-md text-ink-2">{row.views}</td>
                <td className="py-3 pr-4 text-body-md text-ink-2">{row.likes}</td>
                <td className="py-3 pr-4 text-body-md text-ink-2">{row.conversations}</td>
                <td className="py-3 pr-4 text-body-md text-ink-2">{row.visits}</td>
                <td className="py-3 pr-4">
                  <Badge tone={boostTone[row.boostStatus]}>{row.boostStatus}</Badge>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <Button size="compact" variant="tertiary" onClick={() => onViewAnalytics?.(row.id)}>
                      Stats
                    </Button>
                    <Button size="compact" variant="tertiary" onClick={() => onBoost?.(row.id)}>
                      Boost
                    </Button>
                    <Button size="compact" variant="tertiary" onClick={() => onEdit?.(row.id)}>
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Mobile card view */}
      <div className="flex flex-col gap-3 lg:hidden">
        {rows.map((row) => (
          <Card className="p-4" key={row.id} variant="compact">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-body-md font-semibold text-ink">{row.title}</h3>
              <Badge tone={boostTone[row.boostStatus]}>{row.boostStatus}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-caption text-ink-3">Views</p>
                <p className="text-body-md font-semibold text-ink">{row.views}</p>
              </div>
              <div>
                <p className="text-caption text-ink-3">Likes</p>
                <p className="text-body-md font-semibold text-ink">{row.likes}</p>
              </div>
              <div>
                <p className="text-caption text-ink-3">Chats</p>
                <p className="text-body-md font-semibold text-ink">{row.conversations}</p>
              </div>
              <div>
                <p className="text-caption text-ink-3">Visits</p>
                <p className="text-body-md font-semibold text-ink">{row.visits}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="compact" variant="tertiary" onClick={() => onViewAnalytics?.(row.id)}>
                Stats
              </Button>
              <Button size="compact" variant="tertiary" onClick={() => onBoost?.(row.id)}>
                Boost
              </Button>
              <Button size="compact" variant="tertiary" onClick={() => onEdit?.(row.id)}>
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

