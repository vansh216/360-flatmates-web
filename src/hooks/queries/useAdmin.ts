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
    queryFn: () =>
      apiClient.request<AdminListingsResponse>({
        method: "GET",
        path: "/flatmates/moderation/listings",
        query: (filters ?? {}) as Record<string, QueryValue>
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
    }
  });
}

export function useAdminReports(filters?: AdminReportFilters) {
  return useQuery({
    queryKey: ["admin", "reports", filters],
    queryFn: () =>
      apiClient.request<AdminReportsResponse>({
        method: "GET",
        path: "/flatmates/moderation/reports",
        query: (filters ?? {}) as Record<string, QueryValue>
      })
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () =>
      apiClient.request<AdminStats>({
        method: "GET",
        path: "/flatmates/moderation/stats"
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    }
  });
}
