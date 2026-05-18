import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { ShareCardResponse, ShareCardFormat } from "@/lib/api/types";

export function useShareCard(
  listingId: number,
  format?: ShareCardFormat
) {
  return useQuery({
    queryKey: ["share-card", listingId, format],
    queryFn: () =>
      apiClient.request<ShareCardResponse>({
        method: "GET",
        path: `/flatmates/web/listings/${listingId}/share-card`,
        query: format ? { format } : undefined,
        auth: false
      }),
    enabled: listingId > 0
  });
}
