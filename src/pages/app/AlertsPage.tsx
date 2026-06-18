import { useState, useCallback } from "react";
import { Bell, BellOff, Plus, Trash2 } from "lucide-react";
import {
  useSearchAlerts,
  useCreateSearchAlert,
  useUpdateSearchAlert,
  useDeleteSearchAlert
} from "@/hooks/queries";
import { uiStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { AsyncView, EmptyState } from "@/components/ui/StateViews";
import { Skeleton } from "@/components/ui/Skeleton";
import type { SearchAlertCreate } from "@/lib/api/types";

export function AlertsPage() {
  const { data: alerts, isLoading, error, refetch } = useSearchAlerts();
  const createAlert = useCreateSearchAlert();
  const updateAlert = useUpdateSearchAlert();
  const deleteAlert = useDeleteSearchAlert();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlertName, setNewAlertName] = useState("");

  // Confirmation modal for delete
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const confirmTarget = alerts?.find((a) => a.id === confirmDeleteId) ?? null;

  const handleCreate = useCallback(() => {
    if (!newAlertName.trim()) return;

    const payload: SearchAlertCreate = {
      name: newAlertName.trim(),
      filters: {},
      frequency: "daily",
      channels: ["push"]
    };

    createAlert.mutate(payload, {
      onSuccess: () => {
        setShowCreateModal(false);
        setNewAlertName("");
        uiStore.getState().pushToast({
          type: "success",
          title: "Alert created",
        });
      },
      onError: () => {
        uiStore.getState().pushToast({
          type: "error",
          title: "Could not create alert",
        });
      }
    });
  }, [newAlertName, createAlert]);

  const handleToggle = useCallback((id: number, currentlyEnabled: boolean) => {
    updateAlert.mutate(
      { id, payload: { enabled: !currentlyEnabled } },
      {
        onSuccess: () => {
          uiStore.getState().pushToast({
            type: "success",
            title: currentlyEnabled ? "Alert disabled" : "Alert enabled",
          });
        },
        onError: () => {
          uiStore.getState().pushToast({
            type: "error",
            title: "Could not update alert",
          });
        }
      }
    );
  }, [updateAlert]);

  const handleDelete = useCallback((id: number) => {
    deleteAlert.mutate(id, {
      onSuccess: () => {
        uiStore.getState().pushToast({
          type: "success",
          title: "Alert deleted",
        });
      },
      onError: () => {
        uiStore.getState().pushToast({
          type: "error",
          title: "Could not delete alert",
        });
      },
      onSettled: () => {
        setConfirmDeleteId(null);
      }
    });
  }, [deleteAlert]);

  return (
    <div className="flex flex-col gap-5 page-fade">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h1">Search Alerts</h1>
        <Button
          size="compact"
          leadingIcon={<Plus aria-hidden="true" className="h-4 w-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          Create Alert
        </Button>
      </div>

      <AsyncView
        data={alerts ?? []}
        isLoading={isLoading}
        error={error}
        isEmpty={(data) => data.length === 0}
        loading={
          <div className="flex flex-col gap-3" aria-hidden="true">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4 shadow-sm">
                <div className="min-w-0 flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded-[9px]" />
                  <Skeleton className="h-9 w-9 rounded-[9px]" />
                </div>
              </div>
            ))}
          </div>
        }
        errorView={
          <Card className="flex items-center justify-center p-8">
            <EmptyState
              title="No alerts yet"
              description="Create an alert to get notified when new listings match your criteria."
              icon={<Bell aria-hidden="true" className="h-6 w-6" />}
              actionLabel="Create alert"
              onAction={() => setShowCreateModal(true)}
            />
          </Card>
        }
        empty={
          <EmptyState
            title="No alerts yet"
            description="Create an alert to get notified when new listings match your criteria."
            icon={<Bell aria-hidden="true" className="h-6 w-6" />}
            actionLabel="Create alert"
            onAction={() => setShowCreateModal(true)}
          />
        }
        onRetry={() => refetch()}
      >
        {(data) => (
          <div className="flex flex-col gap-3" role="list" aria-label="Search alerts">
            {data.map((alert) => (
              <Card key={alert.id} className="flex items-center justify-between gap-4 p-4" role="listitem">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-body-md font-semibold text-ink truncate">{alert.name}</h2>
                    {alert.enabled ? (
                      <Chip variant="info" selected>Active</Chip>
                    ) : (
                      <Chip variant="info">Paused</Chip>
                    )}
                  </div>
                  <p className="text-caption text-ink-3 mt-1">
                    {alert.frequency} ({alert.channels.join(", ")})
                  </p>
                  {alert.results_sent_count !== undefined && alert.results_sent_count > 0 && (
                    <p className="text-caption text-ink-3">
                      {alert.results_sent_count} results sent
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="icon"
                    size="icon"
                    aria-label={alert.enabled ? `Pause alert: ${alert.name}` : `Resume alert: ${alert.name}`}
                    onClick={() => handleToggle(alert.id, alert.enabled)}
                    loading={updateAlert.isPending}
                  >
                    {alert.enabled ? (
                      <BellOff aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <Bell aria-hidden="true" className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="icon"
                    size="icon"
                    aria-label={`Delete alert: ${alert.name}`}
                    onClick={() => setConfirmDeleteId(alert.id)}
                    loading={deleteAlert.isPending && confirmDeleteId === alert.id}
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </AsyncView>

      {/* Create alert modal */}
      <Modal
        open={showCreateModal}
        title="Create Search Alert"
        description="Get notified when new listings match your search criteria."
        onClose={() => setShowCreateModal(false)}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              loading={createAlert.isPending}
              disabled={!newAlertName.trim()}
            >
              Create
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Input
            label="Alert Name"
            placeholder="e.g. 1BHK in Koramangala under 15k"
            value={newAlertName}
            onChange={(e) => setNewAlertName(e.target.value)}
          />
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={confirmDeleteId !== null}
        title="Delete this alert?"
        description={confirmTarget ? `"${confirmTarget.name}" will be removed and you will stop receiving notifications.` : "This alert will be permanently removed."}
        onClose={() => setConfirmDeleteId(null)}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirmDeleteId(null)}>
              Keep it
            </Button>
            <Button
              className="bg-error text-white shadow-none hover:bg-error/90"
              loading={deleteAlert.isPending}
              onClick={() => {
                if (confirmDeleteId !== null) handleDelete(confirmDeleteId);
              }}
            >
              Delete
            </Button>
          </>
        }
      />
    </div>
  );
}
