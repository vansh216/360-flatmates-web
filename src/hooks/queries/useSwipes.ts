import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type {
  FlatmatesPeer,
  SwipeDeckParams,
  SwipeRequest,
  SwipeResult,
} from "@/lib/api/types";
import type { QueryValue } from "@/lib/api/client";

export function swipeDeckOptions(filters?: SwipeDeckParams) {
  return queryOptions({
    queryKey: ["swipes", "deck", filters],
    queryFn: async () => {
      const response = await apiClient.request<{ profiles: FlatmatesPeer[]; total: number }>({
        method: "GET",
        path: "/flatmates/profiles",
        query: (filters ?? {}) as Record<string, QueryValue>
      });
      return response.profiles || [];
    }
  });
}

export function useSwipeDeck(filters?: SwipeDeckParams) {
  return useQuery(swipeDeckOptions(filters));
}

export function useSwipeAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SwipeRequest) =>
      apiClient.request<SwipeResult>({
        method: "POST",
        path: "/flatmates/swipes",
        body: payload
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["swipes", "deck"] });
    }
  });
}
