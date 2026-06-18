import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Pencil, Rocket, RefreshCw, Trash2 } from "lucide-react";
import {
  useProperty,
  useBoostListing,
  useRenewListing,
  useDeleteProperty
} from "@/hooks/queries";
import { propertyToListingCardProps } from "@/lib/api/adapters";
import { uiStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState, EmptyState } from "@/components/ui/StateViews";
import { ListingCard } from "@/components/molecules/ListingCard";

const PROPERTY_STATUS_LABEL: Record<string, string> = {
  approved: "Published",
  pending_review: "Under Review",
};

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function MyListingDetailPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const listingId = params.id as string;
  const propertyId = Number(listingId);

  const { data: property, isLoading, error, refetch } = useProperty(propertyId);
  const boostListing = useBoostListing();
  const renewListing = useRenewListing();
  const deleteProperty = useDeleteProperty(propertyId);

  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleBoost() {
    if (boostListing.isPending) return;
    boostListing.mutate(
      { propertyId, payload: { duration: "7d" } },
      {
        onSuccess: () =>
          uiStore.getState().pushToast({
            type: "success",
            title: "Listing boosted",
            description: "Your listing will be promoted for 7 days."
          }),
        onError: (err) =>
          uiStore.getState().pushToast({
            type: "error",
            title: "Could not boost listing",
            description: err instanceof Error ? err.message : "Please try again."
          })
      }
    );
  }

  function handleRenew() {
    if (renewListing.isPending) return;
    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + 30);
    renewListing.mutate(
      { propertyId, payload: { available_from: toIsoDate(now), expires_at: toIsoDate(expires) } },
      {
        onSuccess: () =>
          uiStore.getState().pushToast({
            type: "success",
            title: "Listing renewed",
            description: "Your listing is active again for 30 days."
          }),
        onError: (err) =>
          uiStore.getState().pushToast({
            type: "error",
            title: "Could not renew listing",
            description: err instanceof Error ? err.message : "Please try again."
          })
      }
    );
  }

  function handleDelete() {
    if (deleteProperty.isPending) return;
    deleteProperty.mutate(undefined, {
      onSuccess: () => {
        setConfirmDelete(false);
        uiStore.getState().pushToast({ type: "success", title: "Listing deleted" });
        navigate("/manage");
      },
      onError: (err) => {
        setConfirmDelete(false);
        uiStore.getState().pushToast({
          type: "error",
          title: "Could not delete listing",
          description: err instanceof Error ? err.message : "Please try again."
        });
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 page-fade">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-9 rounded-[9px]" />
          <Skeleton className="h-8 w-16 rounded-[10px]" />
        </div>
        <Skeleton variant="listingCard" />
        <Card className="p-5">
          <Skeleton className="h-5 w-28 rounded-full mb-3" />
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex flex-col gap-1 mb-2">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-full" />
            </div>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 page-fade">
      <div className="flex items-center justify-between">
        <Button
          variant="icon"
          size="icon"
          onClick={() => navigate("/manage")}
          aria-label="Back to listings"
        >
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </Button>
        {property && (
          <Button
            variant="secondary"
            size="compact"
            leadingIcon={<Pencil aria-hidden="true" className="h-4 w-4" />}
            onClick={() => navigate(`/my-listings/${listingId}/edit`)}
          >
            Edit
          </Button>
        )}
      </div>

      {error ? (
        <Card className="flex items-center justify-center p-8">
          <ErrorState onRetry={() => refetch()} title="Could not load listing" description="Please try again." />
        </Card>
      ) : !property ? (
        <EmptyState
          title="Listing not found"
          description="This listing may have been removed or you don't have access."
        />
      ) : (
        <>
          <ListingCard
            listing={propertyToListingCardProps(property)}
            onOpen={() => {}}
          />

          <Card className="p-5">
            <h2 className="text-h3 mb-3">Listing Status</h2>
            <div className="flex flex-col gap-2 text-body-md text-ink-2">
              <p>
                <span className="font-semibold text-ink">Status:</span>{" "}
                {PROPERTY_STATUS_LABEL[property.property_status ?? ""] ?? "Draft"}
              </p>
              <p>
                <span className="font-semibold text-ink">Views:</span> {property.view_count ?? 0}
              </p>
              <p>
                <span className="font-semibold text-ink">Interested:</span> {property.interest_count ?? 0}
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-h3 mb-3">Manage Listing</h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                variant="secondary"
                leadingIcon={<Rocket aria-hidden="true" className="h-4 w-4" />}
                loading={boostListing.isPending}
                onClick={handleBoost}
              >
                Boost
              </Button>
              <Button
                variant="secondary"
                leadingIcon={<RefreshCw aria-hidden="true" className="h-4 w-4" />}
                loading={renewListing.isPending}
                onClick={handleRenew}
              >
                Renew
              </Button>
              <Button
                variant="tertiary"
                leadingIcon={<Trash2 aria-hidden="true" className="h-4 w-4" />}
                className="text-error sm:ml-auto"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            </div>
          </Card>
        </>
      )}

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this listing?"
        description="This permanently removes the listing and its photos. This cannot be undone."
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirmDelete(false)}>
              Keep listing
            </Button>
            <Button
              variant="primary"
              className="bg-error hover:bg-error focus-visible:outline-error"
              loading={deleteProperty.isPending}
              onClick={handleDelete}
            >
              Delete listing
            </Button>
          </>
        }
      />
    </div>
  );
}
