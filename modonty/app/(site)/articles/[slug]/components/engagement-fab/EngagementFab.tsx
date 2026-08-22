"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { IconClose, IconTextNormal } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface EngagementFabProps {
  /** The four tabs, rendered by the server and revealed when this opens. */
  children: ReactNode;
  /** Read on the button so it announces what it opens. */
  label: string;
  closeLabel: string;
}

/**
 * The four reader actions as one floating button in the bottom corner (Khalid, 21 Aug).
 *
 * The problem it solves: liking, saving, commenting and sharing are things a reader does after
 * finishing — but most readers never reach the end, and these taps are how the platform learns
 * who cared about an article. A row at the top collects taps from people who have not read
 * (an interest signal that is not one); a row only at the bottom is seen by the few who finish.
 *
 * A corner button is the third answer, and the one every reading app landed on: it is a LAYER,
 * not a band, so it costs nothing from the content-to-chrome ratio the pinned bars are measured
 * against — the page still reads 3.69:1 with this on screen — and it is reachable from the
 * first screen to the last.
 *
 * It sits above the conversion bar and on the far side from the primary CTA, so a thumb reaching
 * for «احجز الآن» never catches it by accident.
 */
export function EngagementFab({ children, label, closeLabel }: EngagementFabProps) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Close on Escape and on a tap anywhere else — the two exits people try without being told.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div
      ref={boxRef}
      /* Sticky, not fixed (Khalid, 21 Aug): these actions belong to the ARTICLE, so the button
         lives inside a box that spans the body and travels with it — it appears when the reading
         starts and is gone once it ends, instead of floating over the whole page.
         `end-3` is the LEFT corner in Arabic, the side the bottom bar's primary button is not on;
         the offset clears that bar (65px) plus the phone's own safe area. */
      className="pointer-events-auto sticky z-40 ms-auto flex w-14 flex-col items-center gap-2 lg:hidden"
      // A bottom offset, not a `100dvh -` top one: dvh inside calc resolved to the device height
      // rather than the viewport in testing, and parked the button 58px below the fold.
      style={{ bottom: "calc(65px + env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      {/* The tabs grow UP out of the button, so they appear between the thumb and the article
          rather than over the button that summoned them. Kept mounted once opened so a count
          the reader just changed does not reset. */}
      <div
        className={cn(
          "flex flex-col items-center gap-2 transition-all duration-200 ease-out motion-reduce:transition-none",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        )}
        aria-hidden={!open}
        // `visibility` and not just opacity: an invisible row must not be reachable by keyboard.
        style={{ visibility: open ? "visible" : "hidden" }}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? closeLabel : label}
        className={cn(
          "grid size-14 place-items-center rounded-full shadow-lg ring-1 ring-black/5 transition-transform active:scale-95 motion-reduce:active:scale-100",
          // The A mark, not a generic ⋯ : since the four action tabs moved to the outline bar
          // this button opens ONE thing — how the text reads. «Aa» is what Safari Reader, Medium
          // and Kindle all put on that control, so it needs no label.
          open
            ? "bg-muted text-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {open ? <IconClose className="size-6" /> : <IconTextNormal className="size-6" />}
      </button>
    </div>
  );
}
