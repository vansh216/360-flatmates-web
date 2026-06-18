import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useConversation,
  useMessages,
  useSendMessage,
  useMyProfile,
  useCreateVisit,
  useReportUserMutation
} from "@/hooks/queries";
import { nextTempMessageId } from "@/hooks/queries/useConversations";
import { apiClient } from "@/lib/api";
import { messageToChatBubbleProps } from "@/lib/api/adapters";
import type { ChatMessageData } from "@/components/molecules/ChatMessageBubble";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/StateViews";
import {
  ChatThread,
  type ChatThreadParticipant,
  type ChatReportReason
} from "@/components/organisms/ChatThread";
import { uiStore } from "@/lib/stores/ui-store";

export function ChatDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const conversationId = Number(id);

  const { data: conversation, isLoading: convLoading, error: convError, refetch: refetchConversation } = useConversation(conversationId);
  const { data: messagesData, isLoading: messagesLoading, error: messagesError, refetch: refetchMessages } = useMessages(conversationId);
  const { data: myProfile } = useMyProfile();
  const sendMessage = useSendMessage();
  const createVisit = useCreateVisit();
  const reportUser = useReportUserMutation();

  // Block-create has no dedicated hook in useBlocks.ts yet (see SHARED
  // FINDINGS); co-locate the mutation here so the chat safety action works.
  const blockUser = useMutation({
    mutationFn: (blockedUserId: number) =>
      apiClient.request<{ message?: string }>({
        method: "POST",
        path: "/flatmates/blocks",
        body: { blocked_user_id: blockedUserId }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });

  // Temp ids (negative) of optimistic sends that failed, so they render with a
  // retry affordance instead of looking permanently "sending".
  const [failedIds, setFailedIds] = useState<Set<number>>(new Set());

  const myUserId = myProfile?.id ?? 0;
  const messages = useMemo<ChatMessageData[]>(
    () =>
      (messagesData?.messages ?? []).map((msg) => {
        const base = messageToChatBubbleProps(msg, myUserId);
        // Negative ids are optimistic, not-yet-acknowledged messages.
        if (msg.id < 0) {
          return {
            ...base,
            status: failedIds.has(msg.id) ? "failed" : "sending"
          };
        }
        return base;
      }),
    [messagesData?.messages, myUserId, failedIds]
  );

  const sendBody = useCallback(
    (body: string, retryTempId?: number) => {
      if (!myUserId) return;
      const tempId = retryTempId ?? nextTempMessageId();

      // Clear any prior failure for a retried message.
      if (retryTempId !== undefined) {
        setFailedIds((prev) => {
          if (!prev.has(retryTempId)) return prev;
          const next = new Set(prev);
          next.delete(retryTempId);
          return next;
        });
      }

      sendMessage.mutate(
        { conversationId, payload: { body }, senderId: myUserId, tempId },
        {
          onError: () => {
            setFailedIds((prev) => new Set(prev).add(tempId));
          }
        }
      );
    },
    [conversationId, myUserId, sendMessage]
  );

  const handleSend = useCallback((message: string) => sendBody(message), [sendBody]);

  const handleRetryMessage = useCallback(
    (messageId: string) => {
      const tempId = Number(messageId);
      const failed = (messagesData?.messages ?? []).find((m) => m.id === tempId);
      if (failed?.body) {
        sendBody(failed.body, tempId);
      }
    },
    [messagesData?.messages, sendBody]
  );

  if (Number.isNaN(conversationId) || conversationId <= 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <ErrorState title="Invalid conversation" description="The conversation ID is not valid." />
      </div>
    );
  }

  if (convLoading || messagesLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {/* Header bar: avatar + name + actions */}
        <div className="flex items-center gap-3 border-b border-line pb-3">
          <Skeleton className="h-[52px] w-[52px] shrink-0 rounded-xl" />
          <div className="flex flex-1 flex-col gap-1.5 min-w-0">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-[9px]" />
            <Skeleton className="h-9 w-9 rounded-[9px]" />
          </div>
        </div>
        {/* Alternating chat message bubbles */}
        <Skeleton variant="chatMessage" />
        <div className="flex justify-end"><Skeleton variant="chatMessage" side="right" /></div>
        <Skeleton variant="chatMessage" />
        <div className="flex justify-end"><Skeleton variant="chatMessage" side="right" /></div>
        {/* Input bar */}
        <div className="mt-auto flex items-center gap-2 rounded-[9px] border border-line bg-surface p-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-8 w-8 rounded-[9px]" />
        </div>
      </div>
    );
  }

  if (convError || messagesError) {
    return (
      <div className="flex items-center justify-center p-8">
        <ErrorState
          title="Could not load conversation"
          description="Please try again."
          onRetry={() => { refetchConversation(); refetchMessages(); }}
        />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center p-8">
        <ErrorState title="Conversation not found" />
      </div>
    );
  }

  // conversation is narrowed to non-null by the guard above
  const conv = conversation;

  const participant: ChatThreadParticipant = {
    name: conv.peer.full_name,
    avatarUrl: conv.peer.profile_image_url,
    mode: conv.peer.mode,
    verified: false,
    compatibilityScore: conv.peer.match_percentage
  };

  function handleScheduleVisit(data: { scheduledDate: string; specialRequirements: string }) {
    const propertyId = conv.context_property?.id;
    if (!propertyId) {
      uiStore.getState().pushToast({
        type: "info",
        title: "Cannot schedule",
        description: "No property is linked to this conversation."
      });
      return;
    }

    createVisit.mutate({
      property_id: propertyId,
      scheduled_date: data.scheduledDate,
      conversation_id: conversationId,
      counterparty_user_id: conv.peer.id,
      special_requirements: data.specialRequirements || undefined,
      visit_context: "property_tour"
    }, {
      onSuccess: () => {
        uiStore.getState().pushToast({
          type: "success",
          title: "Visit scheduled",
          description: `Visit scheduled for ${data.scheduledDate}`
        });
      }
    });
  }

  function handleBlock() {
    blockUser.mutate(conv.peer.id, {
      onSuccess: () => {
        uiStore.getState().pushToast({ type: "success", title: "User blocked" });
        navigate("/chats");
      },
      onError: () => {
        uiStore.getState().pushToast({ type: "error", title: "Could not block user" });
      }
    });
  }

  function handleReport(reason: ChatReportReason, notes: string) {
    reportUser.mutate(
      { reported_user_id: conv.peer.id, reason, notes },
      {
        onSuccess: () => {
          uiStore.getState().pushToast({ type: "success", title: "Report submitted" });
        },
        onError: () => {
          uiStore.getState().pushToast({ type: "error", title: "Could not submit report" });
        }
      }
    );
  }

  return (
    <ChatThread
      participant={participant}
      messages={messages}
      onSend={handleSend}
      onRetryMessage={handleRetryMessage}
      onBlock={handleBlock}
      onReport={handleReport}
      onScheduleVisit={handleScheduleVisit}
    />
  );
}
