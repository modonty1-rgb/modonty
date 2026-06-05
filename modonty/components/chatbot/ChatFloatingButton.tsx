"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { getOptimizedCharacterUrl } from "@/lib/image-utils";
import { useChatSheetStore } from "@/components/chatbot/chat-sheet-store";
import { cn } from "@/lib/utils";

// Mobile-only floating chat launcher — the assistant character avatar + an "online" dot.
// Lifts itself above the article's sticky bottom engagement dock so the two never overlap.
// Article detail pages (/articles/<slug>) render the sticky mobile dock; the /articles
// list and other routes do not — so match the trailing-slash detail path only.
export function ChatFloatingButton() {
  const pathname = usePathname();
  const overBottomBar = pathname?.includes("/articles/") ?? false;

  return (
    <button
      type="button"
      aria-label="فتح المحادثة"
      onClick={() => useChatSheetStore.getState().setOpen(true)}
      className={cn(
        "group fixed left-4 z-40 md:hidden",
        overBottomBar ? "bottom-20" : "bottom-4",
      )}
    >
      <span className="relative block h-14 w-14 overflow-hidden rounded-full shadow-lg transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
        <Image
          src={getOptimizedCharacterUrl(112)}
          alt=""
          fill
          className="object-cover"
          sizes="56px"
        />
      </span>
      <span
        aria-hidden
        className="absolute start-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500"
      />
    </button>
  );
}
