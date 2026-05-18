import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { FlatmatesPeer } from "@/lib/api/types";

export interface BlockedUser {
  id: number;
  blocker_user_id: number;
  blocked_user_id: number;
  created_at: string;
  blocked_user: FlatmatesPeer;
}

export function useBlockedUsers() {
  return useQuery({
    queryKey: ["blocks"],
    queryFn: () =>
      apiClient.request<BlockedUser[]>({
        method: "GET",
        path: "/flatmates/blocks"
      })
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockedUserId: number) =>
      apiClient.request<{ message: string }>({
        method: "DELETE",
        path: `/flatmates/blocks/${blockedUserId}`
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
    }
  });
}
