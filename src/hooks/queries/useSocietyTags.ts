import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { SocietyTagVoteCreate } from "@/lib/api/types";

export interface SocietyTagVoteResult {
  property_id: number;
  tag: string;
  current_vote: string;
  upvotes: number;
  downvotes: number;
  disputed: boolean;
}

export function useVoteSocietyTag() {
  return useMutation({
    mutationFn: ({
      listingId,
      payload
    }: {
      listingId: number;
      payload: SocietyTagVoteCreate;
    }) =>
      apiClient.request<SocietyTagVoteResult>({
        method: "POST",
        path: `/flatmates/listings/${listingId}/society-tags/votes`,
        body: payload
      })
  });
}
