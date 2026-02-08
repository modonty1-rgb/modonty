"use client";

import Image from "next/image";
import { useChatSheet } from "./ChatSheetProvider";
import { cn } from "@/lib/utils";
import { getOptimizedCharacterUrl } from "@/lib/image-utils";

export function ChatTrigger({ variant = "pill", className }: { variant?: "pill" | "nav"; className?: string }) {
  const { open, setOpen } = useChatSheet();
  const size = variant === "nav" ? "h-11 w-11" : "h-9 w-9";

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg transition-all duration-300 ease-out",
        "hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/15 focus:ring-offset-2",
        open && "ring-2 ring-primary/15 ring-offset-2",
        className
      )}
      aria-label="فتح المحادثة"
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
          alt="مدونتي الذكية"
          fill
          className="object-cover"
          sizes="44px"
        />
      </span>
    </button>
  );
}
