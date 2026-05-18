import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useIncomingLikes } from "@/hooks/queries/useMatches";
import { profileToProfileGridCardProps } from "@/lib/api/adapters";
import { Button } from "@/components/ui/Button";
import { ProfileGridCard } from "@/components/molecules/ProfileGridCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { AsyncView, EmptyState } from "@/components/ui/StateViews";

export function LikesPage() {
  const navigate = useNavigate();
  const likesQuery = useIncomingLikes();

  return (
    <div className="flex flex-col gap-5 page-fade">
      <div className="flex items-center gap-3">
        <Button variant="icon" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </Button>
        <h1 className="text-h1">Likes</h1>
      </div>

      <p className="text-body-md text-ink-2">People who liked you</p>

      <AsyncView
        data={likesQuery.data ?? []}
        isLoading={likesQuery.isLoading}
        error={likesQuery.error}
        isEmpty={(data) => data.length === 0}
        loading={<Skeleton variant="profile" count={6} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />}
        empty={
          <EmptyState
            title="No likes yet"
            description="Keep exploring to find connections!"
          />
        }
        onRetry={() => likesQuery.refetch()}
      >
        {(data) => (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((like, i) => {
              const peer = profileToProfileGridCardProps(like.peer);
              return (
                <div key={peer.id} className={`card-appear card-appear-${Math.min(i + 1, 6)}`}>
                  <ProfileGridCard
                    profile={peer}
                    ctaLabel="Match"
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
