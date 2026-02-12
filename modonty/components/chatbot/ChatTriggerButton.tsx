"use client";

import Image from "next/image";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { getOptimizedCharacterUrl } from "@/lib/image-utils";
import { useChatSheetStore } from "@/components/chatbot/chat-sheet-store";

interface ChatTriggerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "pill" | "nav";
}

export const ChatTriggerButton = forwardRef<HTMLButtonElement, ChatTriggerButtonProps>(
  ({ variant = "pill", className, onClick, ...props }, ref) => {
    const size = variant === "nav" ? "h-9 w-9" : "h-9 w-9";

    return (
      <button
        ref={ref}
        type="button"
        aria-label="فتح المحادثة"
        onClick={(e) => {
          onClick?.(e);
          useChatSheetStore.getState().setOpen(true);
        }}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg transition-all duration-300 ease-out",
          "min-h-11 min-w-11",
          "hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/15 focus:ring-offset-2",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "relative flex shrink-0 overflow-hidden rounded-lg border border-muted/25",
            "shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
            size
          )}
        >
          <Image
            src={getOptimizedCharacterUrl(96)}
            alt=""
            fill
            className="object-cover"
            sizes="44px"
          />
        </span>
      </button>
    );
  }
);
ChatTriggerButton.displayName = "ChatTriggerButton";
