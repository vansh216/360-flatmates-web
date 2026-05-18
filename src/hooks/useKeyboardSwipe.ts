import { useEffect } from "react";

interface UseKeyboardSwipeOptions {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  onExpand: () => void;
  onDismiss: () => void;
  enabled: boolean;
}

const CAPTURED_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "Space",
  "Escape"
]);

export function useKeyboardSwipe({
  onPass,
  onLike,
  onSuperLike,
  onExpand,
  onDismiss,
  enabled
}: UseKeyboardSwipeOptions): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!CAPTURED_KEYS.has(event.code)) {
        return;
      }

      // Ignore when user is typing in an input, textarea, or contentEditable element
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      event.preventDefault();

      switch (event.code) {
        case "ArrowLeft":
          onPass();
          break;
        case "ArrowRight":
          onLike();
          break;
        case "ArrowUp":
          onSuperLike();
          break;
        case "Space":
          onExpand();
          break;
        case "Escape":
          onDismiss();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, onPass, onLike, onSuperLike, onExpand, onDismiss]);
}
