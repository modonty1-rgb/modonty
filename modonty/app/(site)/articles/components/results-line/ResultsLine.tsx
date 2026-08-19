import Link from "next/link";

import { IconClose } from "@/lib/icons";

import { buildArchiveHref, type ArchiveState } from "../../helpers/build-archive-href";
import { FOCUS_RING } from "../../helpers/focus-ring";

interface ResultsLineProps {
  total: number;
  /** What the visitor narrowed to, in words — null when nothing is picked. */
  scopeLabel: string | null;
  current: ArchiveState;
}

/**
 * How many, of what, and the way back out.
 *
 * Two gaps in one line. The page had no visible statement of what it was showing, so a visitor
 * arriving on `?category=…` had to read the chips to work out where he was — the «أين أنا؟»
 * question every screen owes an answer to. And there was no way to undo several filters at once:
 * an active-filter count with a single clear-all is the one thing every filter-UX guide agrees on.
 *
 * Plain text and one link — no client JavaScript, so it costs nothing.
 */
export function ResultsLine({ total, scopeLabel, current }: ResultsLineProps) {
  const activeCount = [current.industry, current.category, current.tag, current.search, current.time]
    .filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
      <p className="text-sm text-muted-foreground">
        <span className="font-bold text-foreground">{total.toLocaleString("ar-SA")}</span>{" "}
        {total === 1 ? "مقال" : "مقالاً"}
        {scopeLabel ? ` في ${scopeLabel}` : ""}
      </p>

      {activeCount > 0 && (
        <Link
          href={buildArchiveHref({})}
          className={
            "inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-link transition-colors hover:underline active:bg-muted " +
            FOCUS_RING
          }
        >
          <IconClose className="h-3.5 w-3.5 shrink-0" aria-hidden />
          امسح التصفية ({activeCount.toLocaleString("ar-SA")})
        </Link>
      )}
    </div>
  );
}
