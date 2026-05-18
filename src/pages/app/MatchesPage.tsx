import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useMatches } from "@/hooks/queries/useMatches";
import { profileToProfileGridCardProps } from "@/lib/api/adapters";
import { Button } from "@/components/ui/Button";
import { ProfileGridCard } from "@/components/molecules/ProfileGridCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { AsyncView, EmptyState } from "@/components/ui/StateViews";

export function MatchesPage() {
  const navigate = useNavigate();
  const matchesQuery = useMatches();

  return (
    <div className="flex flex-col gap-5 page-fade">
      <div className="flex items-center gap-3">
        <Button variant="icon" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </Button>
        <h1 className="text-h1">Matches</h1>
      </div>

      <p className="text-body-md text-ink-2">People you matched with</p>

      <AsyncView
        data={matchesQuery.data ?? []}
        isLoading={matchesQuery.isLoading}
        error={matchesQuery.error}
        isEmpty={(data) => data.length === 0}
        loading={<Skeleton variant="profile" count={6} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />}
        empty={
          <EmptyState
            title="No matches yet"
            description="Keep swiping to find your match!"
          />
        }
        onRetry={() => matchesQuery.refetch()}
      >
        {(data) => (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((match, i) => {
              const peer = profileToProfileGridCardProps(match.peer);
              return (
                <div key={peer.id} className={`card-appear card-appear-${Math.min(i + 1, 6)}`}>
                  <ProfileGridCard
                    profile={peer}
                    ctaLabel="Chat"
                    onOpen={(id) => navigate(`/profile/${id}`)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </AsyncView>
    </div>
  );
}
