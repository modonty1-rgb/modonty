"use client";

import { useRef, useEffect, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { IconSend } from "@/lib/icons";
import { cn } from "@/lib/utils";

const MAX_HEIGHT = 200;

interface ComposerProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder: string;
  /** Rendered at the start of the row — used for «اختيار موضوع آخر». */
  startSlot?: React.ReactNode;
  autoFocus?: boolean;
  className?: string;
  /** Lets the parent put the caret back after a send finishes. */
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
}

export function Composer({
  value,
  onValueChange,
  onSubmit,
  disabled = false,
  placeholder,
  startSlot,
  autoFocus = false,
  className,
  textareaRef: externalRef,
}: ComposerProps) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef ?? internalRef;

  // Grow with the text up to a ceiling, then scroll inside — the page must never jump.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  const canSend = !disabled && value.trim().length > 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (canSend) onSubmit();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter breaks the line — what every chat app trains people to expect.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div
        className={cn(
          "flex items-end gap-2 rounded-lg border border-border bg-card p-2",
          "shadow-sm transition-shadow focus-within:border-primary/40 focus-within:shadow-md"
        )}
      >
        {startSlot}
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          // Never on touch: the soft keyboard covers roughly half a phone screen, and on the
          // empty state it buried the topic cards — the primary path for an arriving visitor.
          autoFocus={autoFocus && typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches}
          aria-label="رسالة المحادثة"
          className={cn(
            "min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-relaxed",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none disabled:opacity-60"
          )}
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="إرسال"
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors",
            canSend
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground"
          )}
        >
          <IconSend className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        إنتر يرسل · شِفت مع إنتر يبدأ سطراً جديداً
      </p>
    </form>
  );
}
