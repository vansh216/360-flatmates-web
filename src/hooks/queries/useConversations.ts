import {
  type InfiniteData,
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { useRef } from "react";
import { apiClient } from "@/lib/api";
import type { QueryValue } from "@/lib/api/client";
import type {
  ConversationSummary,
  ConversationCursorPage,
  ConversationCreate,
  MessageOut,
  MessageCreate,
  MessageListResponse
} from "@/lib/api/types";

/**
 * Extract a numeric `before` keyset value from a server-issued opaque cursor.
 *
 * When the backend does not emit `next_cursor` we keep using the derived
 * keyset value. The cursor is sometimes a base64-encoded `before=<id>` blob;
 * when it is, this helper returns the embedded id so we can still pass
 * `before=` as a fallback to older server implementations.
 */
function decodeCursorBefore(cursor: string | null | undefined): number | undefined {
  if (!cursor) return undefined;
  // Plain numeric cursor.
  if (/^\d+$/.test(cursor)) return Number(cursor);
  // Base64-encoded `before=<id>` payload.
  try {
    const decoded = atob(cursor);
    const match = /before=(\d+)/.exec(decoded);
    if (match) return Number(match[1]);
  } catch {
    // Not base64 — fall through.
  }
  return undefined;
}

export const conversationsOptions = queryOptions({
  queryKey: ["conversations"],
  queryFn: async () => {
    const response = await apiClient.request<ConversationCursorPage>({
      method: "GET",
      path: "/flatmates/conversations"
    });
    // Defense-in-depth against envelope shape drift (see RCA for the
    // notifications `h?.filter is not a function` regression).
    return Array.isArray(response?.items) ? response.items : [];
  }
});

export function useConversations() {
  return useQuery(conversationsOptions);
}

const CONVERSATIONS_PAGE_SIZE = 30;

/**
 * Infinite cursor-paginated conversations list.
 *
 * The `/flatmates/conversations` endpoint now returns a `CursorPage<ConversationSummary>`.
 * `useConversations()` keeps returning the first page flat (for backwards-compat with
 * navigation/sidebar code that only renders the first N). For longer lists, callers
 * use this hook to grow the visible set without forcing a refetch.
 */
export function useInfiniteConversations() {
  return useInfiniteQuery({
    queryKey: ["conversations", "infinite"],
    queryFn: async ({ pageParam, signal }) => {
      const response = await apiClient.request<ConversationCursorPage>({
        method: "GET",
        path: "/flatmates/conversations",
        query: { cursor: pageParam, limit: CONVERSATIONS_PAGE_SIZE },
        signal
      });
      return response;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.next_cursor ?? undefined : undefined
  });
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

const MESSAGES_PAGE_SIZE = 50;

/**
 * Infinite messages query (audit F6 #1 + #21).
 *
 * Cursor-based pagination against `GET /flatmates/conversations/{id}/messages`.
 * The backend accepts both opaque `cursor=` (preferred) and a derived keyset
 * `before=<message_id>`. We pass both, with `cursor` taking precedence, so the
 * client works against either implementation: when the server returns an
 * opaque cursor in the next page, we forward it as-is; otherwise we fall back
 * to using the oldest message id of the current page (keyset pagination).
 */
export function messagesInfiniteOptions(conversationId: number) {
  return infiniteQueryOptions({
    queryKey: ["conversations", conversationId, "messages"],
    queryFn: ({ pageParam, signal }) => {
      // pageParam may be a number (keyset: oldest message id) or a string
      // (opaque cursor emitted by the server). Forward as the matching
      // query param; the server uses the most-specific one it understands.
      const query: Record<string, QueryValue> = { limit: MESSAGES_PAGE_SIZE };
      if (typeof pageParam === "string") {
        query.cursor = pageParam;
        // Also forward the derived keyset as a fallback for implementations
        // that only honour `before`.
        const before = decodeCursorBefore(pageParam);
        if (before !== undefined) query.before = before;
      } else if (typeof pageParam === "number") {
        query.before = pageParam;
      }
      return apiClient.request<MessageListResponse>({
        method: "GET",
        path: `/flatmates/conversations/${conversationId}/messages`,
        query,
        signal
      });
    },
    initialPageParam: undefined as number | string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.has_more || lastPage.messages.length === 0) return undefined;
      // Prefer the opaque cursor if the server supplied one; otherwise fall
      // back to the keyset value (oldest message id) which the original
      // implementation relied on.
      return lastPage.next_cursor ?? lastPage.messages[0]?.id;
    },
    enabled: conversationId > 0
  });
}

export function useMessages(conversationId: number) {
  return useInfiniteQuery(messagesInfiniteOptions(conversationId));
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
  previous: Array<
    [readonly unknown[], InfiniteData<MessageListResponse> | undefined]
  >;
}

/** Locate the single infinite-query cache entry for a conversation's messages. */
function messagePageKey(conversationId: number) {
  return {
    queryKey: ["conversations", conversationId, "messages"]
  } as const;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  // Per-hook-instance (per-tab) counter so concurrent sends in the same tab
  // don't collide. (Audit F6 #2 + #20: the previous module-level counter was
  // shared across all tabs and would race between tabs opened in the same
  // session.)
  const tempIdCounterRef = useRef(-1);

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

      const previous = queryClient.getQueriesData<
        InfiniteData<MessageListResponse>
      >(filter);
      const id = tempId ?? tempIdCounterRef.current--;

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
        queryClient.setQueryData<InfiniteData<MessageListResponse>>(key, {
          ...data,
          pages: data.pages.map((page) => {
            const withoutTemp = page.messages.filter((m) => m.id !== id);
            return {
              ...page,
              messages: [...withoutTemp, optimistic],
              total: page.total + (withoutTemp.length === page.messages.length ? 1 : 0)
            };
          })
        });
      }

      return { tempId: id, conversationId, previous };
    },

    onError: (_err, _vars, context) => {
      // Audit F6 #14: restore the previous cache snapshot on error so the
      // optimistic message is reverted. The page tracks failed bodies in a
      // local map to support retry.
      if (!context) return;
      for (const [key, prev] of context.previous) {
        queryClient.setQueryData(key, prev);
      }
    },

    onSuccess: (serverMessage, { conversationId }, context) => {
      // Audit F6 #3: dedup guard + stable created_at sort. The previous
      // implementation always appended `serverMessage` to the end, which
      // could violate the chronological order if the server's `created_at`
      // differs from the optimistic timestamp.
      const filter = messagePageKey(conversationId);
      const pages = queryClient.getQueriesData<
        InfiniteData<MessageListResponse>
      >(filter);
      for (const [key, data] of pages) {
        if (!data) continue;
        queryClient.setQueryData<InfiniteData<MessageListResponse>>(key, {
          ...data,
          pages: data.pages.map((page) => {
            const filtered = page.messages.filter(
              (m) => m.id !== context?.tempId && m.id !== serverMessage.id
            );
            const merged = [...filtered, serverMessage];
            merged.sort((a, b) => {
              const at = a.created_at ?? "";
              const bt = b.created_at ?? "";
              if (at && bt) return at.localeCompare(bt);
              if (at) return -1;
              if (bt) return 1;
              return a.id - b.id;
            });
            return { ...page, messages: merged, total: merged.length };
          })
        });
      }
    },

    onSettled: (_data, error, { conversationId }) => {
      if (error) return;
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

/**
 * Mark a conversation as read (audit F6 #4).
 *
 * The id is supplied at `mutate` time so a single hook instance can mark any
 * row (e.g. on conversation-list click in `ChatsPage`).
 *
 * Calls `POST /flatmates/conversations/{id}/mark-read` and optimistically
 * zeroes the `unread_count` on the matching row in the `["conversations"]`
 * cache so the bell badge updates without a refetch round-trip.
 */
export function useMarkConversationRead() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, number, void>({
    mutationFn: (conversationId) =>
      apiClient.request<{ message: string }>({
        method: "POST",
        path: `/flatmates/conversations/${conversationId}/mark-read`
      }),
    onMutate: (conversationId) => {
      queryClient.setQueryData<ConversationSummary[]>(
        ["conversations"],
        (old) => {
          if (!old) return old;
          return old.map((c) =>
            c.id === conversationId ? { ...c, unread_count: 0 } : c
          );
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}
