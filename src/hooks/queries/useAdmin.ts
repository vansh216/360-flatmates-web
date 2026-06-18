import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type {
  AdminListingsResponse,
  AdminReportsResponse,
  AdminStats,
  AdminListingFilters,
  AdminReportFilters,
  ListingModerationPayload,
  ReportActionPayload
} from "@/lib/api/types";
import type { QueryValue } from "@/lib/api/client";

export function useAdminListings(filters?: AdminListingFilters) {
  return useQuery({
    queryKey: ["admin", "listings", filters],
    queryFn: ({ signal }) =>
      apiClient.request<AdminListingsResponse>({
        method: "GET",
        path: "/flatmates/moderation/listings",
        query: (filters ?? {}) as Record<string, QueryValue>,
        signal
      })
  });
}

export function useAdminModerate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      listingId,
      payload
    }: {
      listingId: number;
      payload: ListingModerationPayload;
    }) =>
      apiClient.request<{ listing_id: number; action: string; status: string; reason?: string }>({
        method: "PUT",
        path: `/flatmates/moderation/listings/${listingId}`,
        body: payload
      }),
    // Optimistically remove the moderated listing from any cached queue so the
    // queue does not flash the just-actioned row while the refetch is in flight.
    onMutate: async ({ listingId }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "listings"] });
      const snapshots = queryClient.getQueriesData<AdminListingsResponse>({
        queryKey: ["admin", "listings"]
      });
      for (const [key, value] of snapshots) {
        if (!value) continue;
        queryClient.setQueryData<AdminListingsResponse>(key, {
          ...value,
          listings: value.listings.filter((l) => l.id !== listingId),
          total: Math.max(0, value.total - 1)
        });
      }
      return { snapshots };
    },
    onError: (_error, _vars, context) => {
      context?.snapshots.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    }
  });
}

export function useAdminReports(filters?: AdminReportFilters) {
  return useQuery({
    queryKey: ["admin", "reports", filters],
    queryFn: ({ signal }) =>
      apiClient.request<AdminReportsResponse>({
        method: "GET",
        path: "/flatmates/moderation/reports",
        query: (filters ?? {}) as Record<string, QueryValue>,
        signal
      })
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: ({ signal }) =>
      apiClient.request<AdminStats>({
        method: "GET",
        path: "/flatmates/moderation/stats",
        signal
      })
  });
}

export function useAdminReportAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      payload
    }: {
      reportId: number;
      payload: ReportActionPayload;
    }) =>
      apiClient.request<{ report_id: number; action: string; status: string }>({
        method: "PUT",
        path: `/flatmates/moderation/reports/${reportId}`,
        body: payload
      }),
    // Optimistically drop the actioned report from the open queue.
    onMutate: async ({ reportId }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "reports"] });
      const snapshots = queryClient.getQueriesData<AdminReportsResponse>({
        queryKey: ["admin", "reports"]
      });
      for (const [key, value] of snapshots) {
        if (!value) continue;
        queryClient.setQueryData<AdminReportsResponse>(key, {
          ...value,
          reports: value.reports.filter((r) => r.id !== reportId),
          total: Math.max(0, value.total - 1)
        });
      }
      return { snapshots };
    },
    onError: (_error, _vars, context) => {
      context?.snapshots.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    }
  });
}
