import { useMemo, useState } from "react";
import { Link } from "react-router";
import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { useAdminListings, useAdminModerate } from "@/hooks/queries";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { TextArea } from "@/components/ui/Input";
import { NetworkImage } from "@/components/ui/NetworkImage";
import { PageLayout, PageHeader } from "@/components/ui/Layout";
import { PriceText } from "@/components/ui/PriceText";
import { SearchBar } from "@/components/ui/SearchBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { AsyncView, EmptyState } from "@/components/ui/StateViews";
import { uiStore } from "@/lib/stores/ui-store";
import type { FlatmateListingAdmin } from "@/lib/api/types";

export function ModerationListingsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error, refetch } = useAdminListings({
    status: "pending_review"
  });
  const moderate = useAdminModerate();

  // Track the listing id currently being actioned so only its row shows the
  // loading/disabled state (never the whole queue) and to prevent double-submit.
  const [actingId, setActingId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<FlatmateListingAdmin | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = useMemo(
    () => {
      const listings = data?.listings ?? [];
      return search
        ? listings.filter(
            (l: FlatmateListingAdmin) =>
              l.title.toLowerCase().includes(search.toLowerCase()) ||
              l.owner_name.toLowerCase().includes(search.toLowerCase()) ||
              l.locality.toLowerCase().includes(search.toLowerCase())
          )
        : listings;
    },
    [search, data]
  );

  function handleApprove(listing: FlatmateListingAdmin) {
    if (actingId !== null) return;
    setActingId(listing.id);
    moderate.mutate(
      { listingId: listing.id, payload: { action: "approve" } },
      {
        onSuccess: () => {
          uiStore.getState().pushToast({
            type: "success",
            title: "Listing approved",
            description: `"${listing.title}" is now live.`
          });
        },
        onError: () => {
          uiStore.getState().pushToast({
            type: "error",
            title: "Could not approve listing",
            description: "Please try again."
          });
        },
        onSettled: () => setActingId(null)
      }
    );
  }

  function handleConfirmReject() {
    if (!rejectTarget || !rejectReason.trim() || actingId !== null) return;
    const target = rejectTarget;
    setActingId(target.id);
    moderate.mutate(
      { listingId: target.id, payload: { action: "reject", reason: rejectReason.trim() } },
      {
        onSuccess: () => {
          setRejectTarget(null);
          setRejectReason("");
          uiStore.getState().pushToast({
            type: "success",
            title: "Listing rejected",
            description: `"${target.title}" was rejected.`
          });
        },
        onError: () => {
          uiStore.getState().pushToast({
            type: "error",
            title: "Could not reject listing",
            description: "Please try again."
          });
        },
        onSettled: () => setActingId(null)
      }
    );
  }

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Moderation"
        title="Listing Review Queue"
        description="Review and moderate pending listings before they go live."
      />

      <div className="mt-6 flex flex-col gap-4">
        <SearchBar
          placeholder="Search by title, owner, or locality"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
        />

        <AsyncView
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={() => refetch()}
          isEmpty={(d) => !d.listings?.length}
          loading={
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex flex-col gap-1">
                          <Skeleton className="h-5 w-3/5" />
                          <Skeleton className="h-3 w-2/5" />
                        </div>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-1/5" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-18 rounded-[10px]" />
                        <Skeleton className="h-8 w-16 rounded-[10px]" />
                        <Skeleton className="h-8 w-16 rounded-[10px]" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
          empty={
            <EmptyState
              title="No pending listings"
              description="All listings have been reviewed. Check back later."
            />
          }
        >
          {() => (
            <ul className="flex flex-col gap-3">
              {filtered.map((listing: FlatmateListingAdmin) => (
                <li key={listing.id}>
                  <ListingRow
                    listing={listing}
                    onApprove={() => handleApprove(listing)}
                    onReject={() => {
                      setRejectTarget(listing);
                      setRejectReason("");
                    }}
                    isActing={actingId === listing.id}
                    actionsDisabled={actingId !== null}
                  />
                </li>
              ))}
              {filtered.length === 0 && search && (
                <li>
                  <EmptyState
                    title="No matches"
                    description={`No listings match "${search}".`}
                  />
                </li>
              )}
            </ul>
          )}
        </AsyncView>
      </div>

      {/* Reject confirmation (destructive: requires a reason) */}
      <Modal
        open={rejectTarget !== null}
        title="Reject Listing"
        description={
          rejectTarget
            ? `Provide a reason for rejecting "${rejectTarget.title}". The owner will see this.`
            : ""
        }
        onClose={() => {
          if (moderate.isPending) return;
          setRejectTarget(null);
          setRejectReason("");
        }}
        footer={
          <>
            <Button
              size="compact"
              variant="secondary"
              onClick={() => {
                setRejectTarget(null);
                setRejectReason("");
              }}
              disabled={moderate.isPending}
            >
              Cancel
            </Button>
            <Button
              size="compact"
              variant="primary"
              loading={moderate.isPending}
              onClick={handleConfirmReject}
              disabled={!rejectReason.trim()}
            >
              Confirm Rejection
            </Button>
          </>
        }
      >
        <TextArea
          label="Reason"
          placeholder="Describe why this listing is being rejected..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
        />
      </Modal>
    </PageLayout>
  );
}

function ListingRow({
  listing,
  onApprove,
  onReject,
  isActing,
  actionsDisabled
}: {
  listing: FlatmateListingAdmin;
  onApprove: () => void;
  onReject: () => void;
  isActing: boolean;
  actionsDisabled: boolean;
}) {
  const statusMap: Record<string, "pending" | "confirmed" | "rejected"> = {
    pending_review: "pending",
    approved: "confirmed",
    rejected: "rejected"
  };

  return (
    <Card as="div" variant="compact">
      <div className="flex items-start gap-3">
        <NetworkImage
          src={listing.main_image_url}
          alt={listing.title}
          wrapperClassName="h-16 w-16 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-body-lg font-semibold text-ink">
                {listing.title}
              </h3>
              <p className="text-caption text-ink-2">
                by {listing.owner_name} &middot; {listing.locality},{" "}
                {listing.city}
              </p>
            </div>
            <Badge
              variant="status"
              status={statusMap[listing.moderation_status] ?? "pending"}
            />
          </div>
          <div className="mt-2 flex items-center gap-3">
            <PriceText value={listing.monthly_rent} variant="inline" />
            {listing.created_at && (
              <span className="text-caption text-ink-3">
                {new Date(listing.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="compact"
              variant="primary"
              loading={isActing}
              disabled={actionsDisabled && !isActing}
              leadingIcon={<CheckCircle2 aria-hidden="true" className="h-4 w-4" />}
              onClick={onApprove}
            >
              Approve
            </Button>
            <Button
              size="compact"
              variant="secondary"
              disabled={actionsDisabled}
              leadingIcon={<XCircle aria-hidden="true" className="h-4 w-4" />}
              onClick={onReject}
            >
              Reject
            </Button>
            <Link to={`/admin/moderation/prescreen/${listing.id}`} tabIndex={-1}>
              <Button
                size="compact"
                variant="tertiary"
                leadingIcon={<Eye aria-hidden="true" className="h-4 w-4" />}
              >
                Review
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
