import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { RoomPosterDashboard, ListingAnalytics } from "@/lib/api/types";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () =>
      apiClient.request<RoomPosterDashboard>({
        method: "GET",
        path: "/flatmates/web/dashboard"
      })
  });
}

export function useListingAnalytics(propertyId: number) {
  return useQuery({
    queryKey: ["dashboard", "analytics", propertyId],
    queryFn: () =>
      apiClient.request<ListingAnalytics>({
        method: "GET",
        path: `/flatmates/web/listings/${propertyId}/analytics`
      }),
    enabled: propertyId > 0
  });
}
