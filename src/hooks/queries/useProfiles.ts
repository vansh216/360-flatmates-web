import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type {
  FlatmatesProfile,
  FlatmatesProfileUpdate,
  FlatmatesPeer,
  PeerFilters
} from "@/lib/api/types";
import type { QueryValue } from "@/lib/api/client";

export function useMyProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: () =>
      apiClient.request<FlatmatesProfile>({
        method: "GET",
        path: "/flatmates/profile"
      })
  });
}

export function useProfile(id: number) {
  return useQuery({
    queryKey: ["profiles", id],
    queryFn: () =>
      apiClient.request<FlatmatesProfile>({
        method: "GET",
        path: `/flatmates/profiles/${id}`
      }),
    enabled: id > 0
  });
}

export function usePeers(filters?: PeerFilters) {
  return useQuery({
    queryKey: ["profiles", "peers", filters],
    queryFn: () =>
      apiClient.request<FlatmatesPeer[]>({
        method: "GET",
        path: "/flatmates/profiles",
        query: (filters ?? {}) as Record<string, QueryValue>
      })
  });
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
    onSuccess: () => {
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
