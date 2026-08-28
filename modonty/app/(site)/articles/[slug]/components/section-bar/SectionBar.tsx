"use client";

import type { ReactNode } from "react";

import { IconChevronLeft } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

interface SectionBarProps {
  /** The section's name — bold, the thing the reader scans for. */
  title: string;
  /** How much is inside. A closed bar without a count is a bar you cannot decide about. */
  count?: number | null;
  open: boolean;
  onToggle: () => void;
  /** Wired to the panel this bar controls, per the ARIA accordion practice. */
  id?: string;
  controls?: string;
  /** Anything that rides at the far end of the bar — the reading tools do, on the outline. */
  end?: ReactNode;
  className?: string;
}

/**
 * One bar, one look, for every section on this page that opens and closes.
 *
 * It exists because the page grew two of them: the sections collapsed during the mobile
 * refactor got a bold title with a count pill, while the FAQ and the comments kept an older
 * shape — a small grey uppercase label with «انقر لعرض» underneath and a different chevron.
 * Two shapes for one action is the reader learning the same control twice.
 *
 * The chevron points along the reading direction when closed and turns down when open, and the
 * bar is never shorter than a fingertip.
 */
export function SectionBar({ title, count, open, onToggle, id, controls, end, className }: SectionBarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-3",
        open && "rounded-b-none border-b-0",
        className
      )}
    >
      <button
        type="button"
        id={id}
        aria-expanded={open}
        aria-controls={controls}
        onClick={onToggle}
        className="-mx-1 flex min-h-11 min-w-0 flex-1 items-center justify-between gap-2 rounded-lg px-1 text-start transition-transform active:scale-[0.99] motion-reduce:active:scale-100"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-bold text-foreground">{title}</span>
          {typeof count === "number" && count > 0 && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold tabular-nums text-primary">
              {count.toLocaleString(SITE_LOCALE)}
            </span>
          )}
        </span>
        <IconChevronLeft
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
            open ? "rotate-90" : "-rotate-90"
          )}
          aria-hidden
        />
      </button>
      {end}
    </div>
  );
}
