import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { CompatibilityBreakdown } from "@/lib/api/types";

export function useCompatibility(peerId: number) {
  return useQuery({
    queryKey: ["compatibility", peerId],
    queryFn: async (): Promise<CompatibilityBreakdown> => {
      return await apiClient.request<CompatibilityBreakdown>({
        method: "GET",
        path: `/flatmates/web/compatibility/${peerId}`
      });
    },
    enabled: peerId > 0
  });
}
