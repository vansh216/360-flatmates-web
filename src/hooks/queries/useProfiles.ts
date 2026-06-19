import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type {
  FlatmatesPeer,
  FlatmatesProfile,
  FlatmatesProfileUpdate,
  PeerCursorPage,
  PeerFilters,
} from "@/lib/api/types";
import type { QueryValue } from "@/lib/api/client";

const PEERS_PAGE_SIZE = 20;

export const myProfileOptions = queryOptions({
  queryKey: ["profile", "me"],
  queryFn: () =>
    apiClient.request<FlatmatesProfile>({
      method: "GET",
      path: "/flatmates/profile"
    })
});

export function profileOptions(id: number) {
  return queryOptions({
    queryKey: ["profiles", id],
    queryFn: () =>
      apiClient.request<FlatmatesPeer>({
        method: "GET",
        path: `/flatmates/profiles/${id}`
      }),
    enabled: id > 0
  });
}

export function peerProfilesOptions(filters?: PeerFilters) {
  return queryOptions({
    queryKey: ["profiles", "peers", filters],
    queryFn: async () => {
      const response = await apiClient.request<PeerCursorPage>({
        method: "GET",
        path: "/flatmates/profiles",
        query: (filters ?? {}) as Record<string, QueryValue>
      });
      return response.items || [];
    }
  });
}

/**
 * Infinite cursor-paginated peer profiles.
 *
 * Used by the swipe deck so additional cards can be pre-fetched as the user
 * approaches the end of the current deck without re-rendering from scratch.
 */
export function peersInfiniteOptions(
  filters?: Omit<PeerFilters, "limit" | "cursor">
) {
  return infiniteQueryOptions({
    queryKey: ["profiles", "peers", "infinite", filters],
    queryFn: async ({ pageParam, signal }) => {
      const response = await apiClient.request<PeerCursorPage>({
        method: "GET",
        path: "/flatmates/profiles",
        query: {
          ...(filters ?? {}),
          cursor: pageParam,
          limit: PEERS_PAGE_SIZE
        } as Record<string, QueryValue>,
        signal
      });
      return response;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.next_cursor ?? undefined : undefined
  });
}

export function useMyProfile() {
  return useQuery(myProfileOptions);
}

export function useProfile(id: number) {
  return useQuery(profileOptions(id));
}

export function usePeers(filters?: PeerFilters) {
  return useQuery(peerProfilesOptions(filters));
}

export function useInfinitePeers(
  filters?: Omit<PeerFilters, "limit" | "cursor">
) {
  return useInfiniteQuery(peersInfiniteOptions(filters));
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FlatmatesProfileUpdate) =>
      apiClient.request<FlatmatesProfile>({
        method: "PATCH",
        path: "/flatmates/profile",
        body: payload
      }),
    onSuccess: (updated) => {
      // Seed the fresh server response straight into the cache so the profile
      // re-renders without a refetch flash, then revalidate in the background.
      queryClient.setQueryData(["profile", "me"], updated);
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    }
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FlatmatesProfileUpdate) =>
      apiClient.request<FlatmatesProfile>({
        method: "POST",
        path: "/flatmates/profile",
        body: payload
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    }
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.request<{ message: string }>({
        method: "DELETE",
        path: "/users/me"
      }),
    onSuccess: () => {
      // The whole session is gone — drop all cached queries rather than
      // invalidating a single one. The caller handles sign-out + redirect.
      queryClient.clear();
    }
  });
}
