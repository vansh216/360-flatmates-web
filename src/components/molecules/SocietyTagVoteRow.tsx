import type { HTMLAttributes } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { cn, focusRing, interactiveMotion } from "../ui/component-utils";

export type SocietyVote = "up" | "down" | null;

export interface SocietyTagVoteRowProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  voteCount: number;
  myVote?: SocietyVote;
  disputed?: boolean;
  onUpvote?: () => void;
  onDownvote?: () => void;
}

export function SocietyTagVoteRow({
  label,
  voteCount,
  myVote = null,
  disputed = false,
  onUpvote,
  onDownvote,
  className,
  ...props
}: SocietyTagVoteRowProps) {
  return (
    <div className={cn("flex min-h-11 items-center gap-2 border-b border-line py-2", className)} {...props}>
      <span className="min-w-0 flex-1 truncate text-body-md text-ink">{label}</span>
      {disputed ? <span aria-label="Disputed" className="h-2 w-2 rounded-full bg-warning" /> : null}
      <button
        type="button"
        aria-label={`Upvote ${label}`}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-ink-3 hover:bg-accent-soft",
          myVote === "up" && "text-accent",
          interactiveMotion,
          focusRing
        )}
        onClick={onUpvote}
      >
        <ThumbsUp aria-hidden="true" className="h-4 w-4" />
      </button>
      <span className="min-w-6 text-center text-caption text-ink-2">{voteCount}</span>
      <button
        type="button"
        aria-label={`Downvote ${label}`}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-ink-3 hover:bg-error-soft",
          myVote === "down" && "text-error",
          interactiveMotion,
          focusRing
        )}
        onClick={onDownvote}
      >
        <ThumbsDown aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}

