import { useAdminStats } from "@/hooks/queries";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/StateViews";
import { PageHeader } from "@/components/ui/Layout";
import {
  Users,
  Building2,
  ShieldCheck,
  Heart,
  CalendarCheck,
  MessageCircle
} from "lucide-react";

interface AdminStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description?: string;
}

function AdminStatCard({ icon, label, value, description }: AdminStatCardProps) {
  return (
    <Card className="flex items-start gap-4 p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-label-md text-ink-3">{label}</p>
        <p className="text-h2 tabular-nums text-ink">{value}</p>
        {description ? (
          <p className="mt-0.5 text-caption text-ink-3">{description}</p>
        ) : null}
      </div>
    </Card>
  );
}

export function AdminStatsPage() {
  const { data: stats, isLoading, error, refetch } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton variant="block" count={6} className="h-28" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <ErrorState
          title="Could not load platform stats"
          description="Try refreshing the page."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Platform Stats" description="Key metrics for the 360 Flatmates platform." />

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminStatCard
          icon={<Users aria-hidden="true" className="h-6 w-6" />}
          label="Total Users"
          value={stats.total_users}
        />
        <AdminStatCard
          icon={<Building2 aria-hidden="true" className="h-6 w-6" />}
          label="Total Listings"
          value={stats.total_listings}
        />
        <AdminStatCard
          icon={<ShieldCheck aria-hidden="true" className="h-6 w-6" />}
          label="Pending Moderation"
          value={stats.pending_moderation}
          description="Listings awaiting review"
        />
        <AdminStatCard
          icon={<Heart aria-hidden="true" className="h-6 w-6" />}
          label="Total Matches"
          value={stats.total_matches}
        />
        <AdminStatCard
          icon={<CalendarCheck aria-hidden="true" className="h-6 w-6" />}
          label="Total Visits"
          value={stats.total_visits}
        />
        <AdminStatCard
          icon={<MessageCircle aria-hidden="true" className="h-6 w-6" />}
          label="Active Conversations"
          value={stats.active_conversations}
        />
      </div>
    </div>
  );
}
