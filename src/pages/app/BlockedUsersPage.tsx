import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useBlockedUsers, useUnblockUser } from "@/hooks/queries";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { AsyncView } from "@/components/ui/StateViews";

export function BlockedUsersPage() {
  const navigate = useNavigate();
  const { data: blockedUsers, isLoading, error, refetch } = useBlockedUsers();
  const unblockUser = useUnblockUser();
  const [pendingId, setPendingId] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-5 page-fade">
      <div className="flex items-center gap-3">
        <Button variant="icon" size="icon" onClick={() => navigate("/profile")}>
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </Button>
        <h1 className="text-h1">Blocked Users</h1>
      </div>

      <AsyncView
        data={blockedUsers ?? []}
        isLoading={isLoading}
        error={error}
        isEmpty={(data) => data.length === 0}
        loading={<Skeleton variant="listItem" count={3} />}
        empty={
          <p className="py-8 text-center text-body-md text-ink-3">
            No blocked users. You can block someone from their profile or conversation.
          </p>
        }
        onRetry={() => refetch()}
      >
        {(data) => (
          <div className="flex flex-col gap-3">
            {data.map((block) => (
              <Card key={block.id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    name={block.blocked_user.full_name}
                    src={block.blocked_user.profile_image_url}
                    size="compact"
                    shape="circle"
                  />
                  <div className="min-w-0">
                    <p className="text-body-md font-semibold text-ink truncate">
                      {block.blocked_user.full_name}
                    </p>
                    {block.blocked_user.locality && (
                      <p className="text-caption text-ink-3 truncate">
                        {block.blocked_user.locality}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="tertiary"
                  size="compact"
                  onClick={() => {
                    setPendingId(block.blocked_user_id);
                    unblockUser.mutate(block.blocked_user_id, {
                      onSettled: () => setPendingId(null)
                    });
                  }}
                  loading={unblockUser.isPending && pendingId === block.blocked_user_id}
                >
                  Unblock
                </Button>
              </Card>
            ))}
          </div>
        )}
      </AsyncView>
    </div>
  );
}
