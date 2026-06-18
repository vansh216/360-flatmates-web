import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type {
  ConversationSummary,
  ConversationCreate,
  MessageOut,
  MessageCreate,
  MessageListResponse
} from "@/lib/api/types";

export const conversationsOptions = queryOptions({
  queryKey: ["conversations"],
  queryFn: () =>
    apiClient.request<ConversationSummary[]>({
      method: "GET",
      path: "/flatmates/conversations"
    })
});

export function useConversations() {
  return useQuery(conversationsOptions);
}

export function useConversation(id: number) {
  return useQuery({
    queryKey: ["conversations", id],
    queryFn: () =>
      apiClient.request<ConversationSummary>({
        method: "GET",
        path: `/flatmates/conversations/${id}`
      }),
    enabled: id > 0
  });
}

export function useMessages(conversationId: number, page?: number) {
  return useQuery({
    queryKey: ["conversations", conversationId, "messages", page],
    queryFn: ({ signal }) =>
      apiClient.request<MessageListResponse>({
        method: "GET",
        path: `/flatmates/conversations/${conversationId}/messages`,
        query: page ? { page } : undefined,
        signal
      }),
    enabled: conversationId > 0
  });
}

/**
 * Temp message IDs for optimistic sends are negative so they never collide
 * with real backend IDs (which are positive integers). The bubble adapter
 * keys on `String(id)`, so a stable temp id keeps the optimistic bubble in
 * place until the server message replaces it (preventing a flicker / double
 * render against the SSE echo).
 */
let tempMessageId = -1;
export function nextTempMessageId(): number {
  return tempMessageId--;
}

interface SendMessageVars {
  conversationId: number;
  payload: MessageCreate;
  /** Caller-supplied sender id so the optimistic bubble renders on the right. */
  senderId: number;
  /** When retrying a failed message, reuse its temp id instead of minting one. */
  tempId?: number;
}

interface SendMessageContext {
  tempId: number;
  conversationId: number;
  previous: Array<[readonly unknown[], MessageListResponse | undefined]>;
}

/** Locate every cached `messages` page for a conversation (page param varies). */
function messagePageKey(conversationId: number) {
  return {
    predicate: (query: { queryKey: readonly unknown[] }) =>
      query.queryKey[0] === "conversations" &&
      query.queryKey[1] === conversationId &&
      query.queryKey[2] === "messages"
  };
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<MessageOut, Error, SendMessageVars, SendMessageContext>({
    mutationFn: ({ conversationId, payload }) =>
      apiClient.request<MessageOut>({
        method: "POST",
        path: `/flatmates/conversations/${conversationId}/messages`,
        body: payload
      }),

    onMutate: async ({ conversationId, payload, senderId, tempId }) => {
      const filter = messagePageKey(conversationId);
      await queryClient.cancelQueries(filter);

      const previous = queryClient.getQueriesData<MessageListResponse>(filter);
      const id = tempId ?? nextTempMessageId();

      const optimistic: MessageOut = {
        id,
        conversation_id: conversationId,
        sender_id: senderId,
        body: payload.body,
        attachment_url: payload.attachment_url,
        message_type: payload.message_type ?? "text",
        metadata: { __optimistic: true },
        created_at: new Date().toISOString()
      };

      // Append the optimistic message to every cached page; drop any prior
      // failed copy carrying the same temp id (retry path).
      for (const [key, data] of previous) {
        if (!data) continue;
        const withoutTemp = data.messages.filter((m) => m.id !== id);
        queryClient.setQueryData<MessageListResponse>(key, {
          ...data,
          messages: [...withoutTemp, optimistic],
          total: data.total + (withoutTemp.length === data.messages.length ? 1 : 0)
        });
      }

      return { tempId: id, conversationId, previous };
    },

    onError: () => {
      // Intentionally keep the optimistic message in cache: the page tags its
      // temp id as "failed" so the bubble stays visible with a retry control.
      // Removing it here would make the user's text vanish on a network error.
      // `onSettled` does NOT invalidate on error (see below) so the optimistic
      // bubble survives until the user retries or the next successful fetch.
    },

    onSuccess: (serverMessage, { conversationId }, context) => {
      // Swap the optimistic temp message for the authoritative server message
      // in-place. Doing this (rather than only invalidating) means the SSE
      // `message` echo that follows finds the real id already present, so the
      // user's own message never double-renders.
      const filter = messagePageKey(conversationId);
      const pages = queryClient.getQueriesData<MessageListResponse>(filter);
      for (const [key, data] of pages) {
        if (!data) continue;
        const messages = data.messages
          .filter((m) => m.id !== context?.tempId && m.id !== serverMessage.id)
          .concat(serverMessage);
        queryClient.setQueryData<MessageListResponse>(key, {
          ...data,
          messages,
          total: messages.length
        });
      }
    },

    onSettled: (_data, error, { conversationId }) => {
      // On failure, leave the optimistic (now "failed") bubble in place so the
      // user can retry — invalidating would refetch and wipe it.
      if (error) return;
      // Reconcile with the server (ordering, read receipts) and refresh the
      // conversation list preview / unread badge.
      queryClient.invalidateQueries(messagePageKey(conversationId));
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ConversationCreate) =>
      apiClient.request<ConversationSummary>({
        method: "POST",
        path: "/flatmates/conversations",
        body: payload
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}
