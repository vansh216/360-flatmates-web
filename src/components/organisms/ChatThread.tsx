import type { HTMLAttributes } from "react";
import { useEffect, useRef, useState } from "react";
import { CalendarPlus, CloudOff, Paperclip, Send, Smile } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Badge, type UserMode } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { TrustBadge } from "../ui/TrustBadge";
import { ChatMessageBubble, type ChatMessageData } from "../molecules/ChatMessageBubble";
import { MatchContextCard, type MatchContextCardData } from "../molecules/MatchContextCard";
import { QnACard, type QnACardProps } from "../molecules/QnACard";
import { cn } from "../ui/component-utils";

export interface ChatThreadParticipant {
  name: string;
  avatarUrl?: string | null;
  mode?: UserMode;
  verified?: boolean;
  compatibilityScore?: number;
}

export interface ChatThreadProps extends HTMLAttributes<HTMLElement> {
  participant: ChatThreadParticipant;
  messages: ChatMessageData[];
  matchContext?: MatchContextCardData;
  qna?: QnACardProps[];
  disconnected?: boolean;
  onSend?: (message: string) => void;
  onRetryMessage?: (messageId: string) => void;
  onScheduleVisit?: (data: { scheduledDate: string; specialRequirements: string }) => void;
}

export function ChatThread({
  participant,
  messages,
  matchContext,
  qna = [],
  disconnected = false,
  onSend,
  onRetryMessage,
  onScheduleVisit,
  className,
  ...props
}: ChatThreadProps) {
  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  /* Visit scheduling modal state */
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [visitNotes, setVisitNotes] = useState("");

  /* Auto-scroll to bottom when new messages arrive */
  useEffect(() => {
    const el = logRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  function submit() {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    onSend?.(trimmed);
    setDraft("");
  }

  function handleScheduleVisit() {
    if (!visitDate) return;
    onScheduleVisit?.({
      scheduledDate: visitDate,
      specialRequirements: visitNotes,
    });
    setShowScheduleModal(false);
    setVisitDate("");
    setVisitNotes("");
  }

  return (
    <section className={cn("flex h-full min-h-[calc(100dvh-4rem)] md:min-h-[640px] flex-col bg-paper", className)} {...props}>
      <header className="flex min-h-14 items-center gap-3 border-b border-line bg-surface px-4">
        <Avatar name={participant.name} size="sm" src={participant.avatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-body-md font-semibold text-ink">{participant.name}</h2>
            {participant.verified ? <span className="h-2 w-2 rounded-full bg-success" /> : null}
            {participant.mode ? <Badge mode={participant.mode} variant="mode" /> : null}
            {participant.compatibilityScore ? (
              <span className="rounded-full bg-success-soft px-2 py-0.5 text-caption font-semibold text-success">
                {participant.compatibilityScore}% match
              </span>
            ) : null}
          </div>
        </div>
        {disconnected ? <CloudOff aria-label="Messages may be delayed" className="h-5 w-5 text-ink-3" /> : null}
      </header>
      <div className="flex flex-col gap-3 border-b border-line bg-paper px-4 py-3">
        {matchContext ? <MatchContextCard item={matchContext} /> : null}
        {qna.map((item) => (
          <QnACard key={item.question} {...item} />
        ))}
      </div>
      <div ref={logRef} role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <ChatMessageBubble key={message.id} message={message} onRetry={onRetryMessage} />
        ))}
      </div>
      <footer className="border-t border-line bg-paper/88 p-3 backdrop-blur-[9px]">
        <div className="flex items-center gap-2">
          <TrustBadge variant="privacy" />
          <Button aria-label="Emoji" size="icon" variant="icon">
            <Smile aria-hidden="true" className="h-5 w-5" />
          </Button>
          <Input
            aria-label="Type a message"
            placeholder="Type a message..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
          />
          <Button
            aria-label="Schedule a visit"
            size="icon"
            variant="icon"
            onClick={() => setShowScheduleModal(true)}
          >
            <CalendarPlus aria-hidden="true" className="h-5 w-5" />
          </Button>
          <Button aria-label="Attach image" size="icon" variant="icon">
            <Paperclip aria-hidden="true" className="h-5 w-5" />
          </Button>
          <Button aria-label="Send message" disabled={!draft.trim()} size="icon" onClick={submit}>
            <Send aria-hidden="true" className="h-5 w-5" />
          </Button>
        </div>
      </footer>

      {/* Schedule Visit Modal */}
      <Modal
        open={showScheduleModal}
        title="Schedule a Visit"
        description={`Schedule a visit with ${participant.name}`}
        onClose={() => setShowScheduleModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button disabled={!visitDate} onClick={handleScheduleVisit}>
              Schedule
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="visit-date" className="text-label-md text-ink-2">
              Date
            </label>
            <input
              id="visit-date"
              type="date"
              className="h-12 w-full rounded-[9px] border border-line bg-surface px-3 text-body-md text-ink focus:border-accent focus:shadow-focus focus:outline-none"
              value={visitDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setVisitDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="visit-notes" className="text-label-md text-ink-2">
              Special requirements (optional)
            </label>
            <textarea
              id="visit-notes"
              rows={3}
              placeholder="Any special requests or notes..."
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              className="w-full rounded-[9px] border border-line bg-surface px-3 py-3 text-body-md text-ink placeholder:text-ink-3 focus:border-accent focus:shadow-focus focus:outline-none resize-y"
            />
          </div>
        </div>
      </Modal>
    </section>
  );
}
