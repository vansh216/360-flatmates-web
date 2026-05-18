import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { IncomingLikeSummary, MatchSummary } from "@/lib/api/types";

export function useIncomingLikes(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["incoming-likes", limit, offset],
    queryFn: () =>
      apiClient.request<IncomingLikeSummary[]>({
        method: "GET",
        path: "/flatmates/likes",
        query: { limit, offset }
      })
  });
}

export function useMatches() {
  return useQuery({
    queryKey: ["matches"],
    queryFn: () =>
      apiClient.request<MatchSummary[]>({
        method: "GET",
        path: "/flatmates/matches"
      })
  });
}

export function useUnmatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: number) =>
      apiClient.request<{ message: string }>({
        method: "PUT",
        path: `/flatmates/matches/${matchId}/unmatch`
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}
