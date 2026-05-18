import { renderHook } from "@testing-library/react";
import { useKeyboardSwipe } from "../useKeyboardSwipe";
import { describe, it, expect, vi, beforeEach } from "vitest";

function fireKeyDown(
  key: string,
  code: string,
  target: EventTarget = window,
  overrides?: Partial<KeyboardEventInit>
): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key,
    code,
    bubbles: true,
    ...overrides,
  });
  target.dispatchEvent(event);
  return event;
}

describe("useKeyboardSwipe", () => {
  const handlers = {
    onPass: vi.fn(),
    onLike: vi.fn(),
    onSuperLike: vi.fn(),
    onExpand: vi.fn(),
    onDismiss: vi.fn(),
    enabled: true as boolean,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls onPass on ArrowLeft", () => {
    renderHook(() => useKeyboardSwipe(handlers));
    fireKeyDown("ArrowLeft", "ArrowLeft");
    expect(handlers.onPass).toHaveBeenCalledTimes(1);
  });

  it("calls onLike on ArrowRight", () => {
    renderHook(() => useKeyboardSwipe(handlers));
    fireKeyDown("ArrowRight", "ArrowRight");
    expect(handlers.onLike).toHaveBeenCalledTimes(1);
  });

  it("calls onSuperLike on ArrowUp", () => {
    renderHook(() => useKeyboardSwipe(handlers));
    fireKeyDown("ArrowUp", "ArrowUp");
    expect(handlers.onSuperLike).toHaveBeenCalledTimes(1);
  });

  it("calls onExpand on Space", () => {
    renderHook(() => useKeyboardSwipe(handlers));
    fireKeyDown(" ", "Space");
    expect(handlers.onExpand).toHaveBeenCalledTimes(1);
  });

  it("calls onDismiss on Escape", () => {
    renderHook(() => useKeyboardSwipe(handlers));
    fireKeyDown("Escape", "Escape");
    expect(handlers.onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does NOT call handlers when enabled is false", () => {
    renderHook(() =>
      useKeyboardSwipe({ ...handlers, enabled: false })
    );
    fireKeyDown("ArrowLeft", "ArrowLeft");
    fireKeyDown("ArrowRight", "ArrowRight");
    fireKeyDown("ArrowUp", "ArrowUp");
    fireKeyDown(" ", "Space");
    fireKeyDown("Escape", "Escape");
    expect(handlers.onPass).not.toHaveBeenCalled();
    expect(handlers.onLike).not.toHaveBeenCalled();
    expect(handlers.onSuperLike).not.toHaveBeenCalled();
    expect(handlers.onExpand).not.toHaveBeenCalled();
    expect(handlers.onDismiss).not.toHaveBeenCalled();
  });

  it("does NOT call handlers when focus is in an INPUT element", () => {
    renderHook(() => useKeyboardSwipe(handlers));
    const input = document.createElement("input");
    document.body.appendChild(input);
    fireKeyDown("ArrowLeft", "ArrowLeft", input);
    expect(handlers.onPass).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("does NOT call handlers when focus is in a TEXTAREA element", () => {
    renderHook(() => useKeyboardSwipe(handlers));
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    fireKeyDown("ArrowRight", "ArrowRight", textarea);
    expect(handlers.onLike).not.toHaveBeenCalled();
    document.body.removeChild(textarea);
  });

  it("does NOT call handlers when focus is in a contentEditable element", () => {
    renderHook(() => useKeyboardSwipe(handlers));
    const div = document.createElement("div");
    // jsdom does not properly reflect contentEditable as isContentEditable,
    // so we set the attribute and mock the property.
    div.setAttribute("contenteditable", "true");
    Object.defineProperty(div, "isContentEditable", { value: true });
    document.body.appendChild(div);
    fireKeyDown("ArrowUp", "ArrowUp", div);
    expect(handlers.onSuperLike).not.toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it("calls event.preventDefault() on captured keys", () => {
    renderHook(() => useKeyboardSwipe(handlers));
    const event = new KeyboardEvent("keydown", {
      key: "ArrowLeft",
      code: "ArrowLeft",
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    window.dispatchEvent(event);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("does not call preventDefault for non-captured keys", () => {
    renderHook(() => useKeyboardSwipe(handlers));
    const event = fireKeyDown("a", "KeyA");
    expect(event.defaultPrevented).toBe(false);
  });

  it("cleans up listener on unmount", () => {
    const { unmount } = renderHook(() => useKeyboardSwipe(handlers));
    unmount();
    fireKeyDown("ArrowLeft", "ArrowLeft");
    expect(handlers.onPass).not.toHaveBeenCalled();
  });

  it("ignores keys that are not in the captured set", () => {
    renderHook(() => useKeyboardSwipe(handlers));
    fireKeyDown("a", "KeyA");
    fireKeyDown("Enter", "Enter");
    fireKeyDown("Tab", "Tab");
    expect(handlers.onPass).not.toHaveBeenCalled();
    expect(handlers.onLike).not.toHaveBeenCalled();
    expect(handlers.onSuperLike).not.toHaveBeenCalled();
    expect(handlers.onExpand).not.toHaveBeenCalled();
    expect(handlers.onDismiss).not.toHaveBeenCalled();
  });
});
