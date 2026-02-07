"use client";

import { Sparkles } from "lucide-react";
import { useChatSheet } from "./ChatSheetProvider";
import { cn } from "@/lib/utils";

export function ChatTrigger({ variant = "pill", className }: { variant?: "pill" | "nav"; className?: string }) {
  const { open, setOpen } = useChatSheet();
  const size = variant === "nav" ? "h-11 w-11" : "h-9 w-9";

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "inline-flex rounded-full p-[2px] bg-gradient-to-r from-purple-500 to-cyan-500",
        open && "ring-2 ring-primary/30 ring-offset-2",
        className
      )}
      aria-label="فتح المحادثة"
    >
      <span className={cn("flex items-center justify-center rounded-full bg-background text-foreground hover:bg-muted/50", size)}>
        <Sparkles className="h-5 w-5 shrink-0" strokeWidth={2} />
      </span>
    </button>
  );
}
