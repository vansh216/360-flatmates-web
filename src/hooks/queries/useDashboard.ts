import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { RoomPosterDashboard, ListingAnalytics } from "@/lib/api/types";

export type AnalyticsPeriod = "7d" | "30d" | "all";

export const dashboardOptions = queryOptions({
  queryKey: ["dashboard", "stats"],
  queryFn: ({ signal }) =>
    apiClient.request<RoomPosterDashboard>({
      method: "GET",
      path: "/flatmates/web/dashboard",
      signal
    })
});

export function useDashboardStats() {
  return useQuery(dashboardOptions);
}

export function useListingAnalytics(propertyId: number, period: AnalyticsPeriod = "30d") {
  return useQuery({
    queryKey: ["dashboard", "analytics", propertyId, period],
    queryFn: ({ signal }) =>
      apiClient.request<ListingAnalytics>({
        method: "GET",
        path: `/flatmates/web/listings/${propertyId}/analytics`,
        query: { period },
        signal
      }),
    enabled: propertyId > 0
  });
}
