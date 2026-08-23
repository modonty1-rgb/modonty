import Link from "next/link";

import { IconFootprints, IconCoffee, IconArmchair } from "@/lib/icons";
import { cn } from "@/lib/utils";

import { buildArchiveHref, type ArchiveState } from "@/lib/articles/archive/build-archive-href";
import { FOCUS_RING } from "@/lib/articles/archive/focus-ring";
import { READING_TIME_BUCKETS, type ReadingTimeBucket } from "@/lib/articles/archive/reading-time-buckets";

import type { ComponentType, SVGProps } from "react";

const ICONS: Record<ReadingTimeBucket, ComponentType<SVGProps<SVGSVGElement>>> = {
  short: IconFootprints,
  medium: IconCoffee,
  long: IconArmchair,
};

/** One fixed tone per bucket — walking · coffee · settling in. */
const TONES: Record<ReadingTimeBucket, { on: string; icon: string }> = {
  short: { on: "bg-action-listen text-action-listen-foreground ring-action-listen", icon: "text-action-listen" },
  medium: { on: "bg-action-save text-action-save-foreground ring-action-save", icon: "text-action-save" },
  long: { on: "bg-action-share text-action-share-foreground ring-action-share", icon: "text-action-share" },
};

interface ReadingTimeBarProps {
  counts: Record<ReadingTimeBucket, number>;
  current: ArchiveState;
}

/**
 * «عندك كم دقيقة؟» — the one thing on this page no other archive has.
 *
 * Vercel, Stripe and Intercom all filter by topic and nothing else (measured 2026-08-19). Time is
 * a different question, and one every reader actually asks. It also belongs to nobody: it
 * describes the article, not the partner who paid for it.
 *
 * STANDALONE (Khalid, 21 Aug): picking a time does NOT inherit the field, and the counts are the
 * whole archive's, not the current field's. Before this, choosing «السياحة العلاجية» dimmed «على
 * الماشي» to zero and the visitor could not ask the simple question «what can I read in three
 * minutes?» without first clearing the field himself.
 */
export function ReadingTimeBar({ counts, current }: ReadingTimeBarProps) {
  const total = counts.short + counts.medium + counts.long;
  if (total === 0) return null;

  return (
    // A GRID of three on the phone, not a scroll strip (Khalid's screenshot, 23 Aug: «جلسة
    // روقان» clipped at the screen edge — the chips wore `shrink-0` over nowrap text, so
    // their natural width beat 390px and the third one paid for it). Three questions the
    // reader picks ONE of should all be on screen at once; stacked like the field tiles
    // above, the row speaks the same visual language as the rest of the filters. The
    // desktop keeps its horizontal strip untouched.
    <nav
      aria-label="اقرأ حسب وقتك"
      // `w-full`: the bar sits inside a `justify-between` flex row, so without an explicit
      // width it shrinks to its content and hugs one side, leaving dead space beside it
      // (Khalid's screenshot, 23 Aug: «make the button stretch on the space»). Full width
      // lets the three columns split whatever the row has. Desktop keeps its content-wide
      // strip so the results line can share the same row.
      className="w-full grid grid-cols-3 gap-2 min-[1240px]:w-auto min-[1240px]:-mx-1 min-[1240px]:flex min-[1240px]:overflow-x-auto min-[1240px]:px-1 min-[1240px]:pb-0.5 min-[1240px]:scrollbar-none"
    >
      {READING_TIME_BUCKETS.map((bucket) => {
        const Icon = ICONS[bucket.key];
        const tone = TONES[bucket.key];
        const count = counts[bucket.key];
        const active = current.time === bucket.key;

        return (
          <Link
            key={bucket.key}
            // Time still drops the field/category/tag (its own axis — 21 Aug), but it KEEPS
            // the search (Khalid, 23 Aug: he typed «الظهر», tapped «على الماشي», and the two
            // ignored each other). A search is the reader's question; time only narrows it.
            href={buildArchiveHref(
              active ? { search: current.search } : { time: bucket.key, search: current.search }
            )}
            aria-current={active ? "true" : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-center ring-1 transition-colors active:scale-[0.98] min-[1240px]:min-h-9 min-[1240px]:flex-1 min-[1240px]:shrink-0 min-[1240px]:flex-row min-[1240px]:gap-2 min-[1240px]:px-3 " + FOCUS_RING,
              active ? tone.on : "bg-card ring-border hover:ring-primary/40"
            )}
          >
            <Icon className={cn("size-5 shrink-0", active ? "" : tone.icon)} aria-hidden />
            <span className="min-w-0 leading-tight min-[1240px]:text-start">
              <span className={cn("block whitespace-nowrap text-[13px] font-bold", active ? "" : "text-foreground")}>
                {bucket.label}
              </span>
              {/* Parentheses, NOT a middot, before the count: in Arabic-Indic numerals the
                  zero IS a dot, so «١٦ ·» read as «١٦٠» — Khalid caught it on the live
                  screen (23 Aug) as a wrong number, not a separator. */}
              <span className={cn("block whitespace-nowrap text-[10px]", active ? "opacity-80" : "text-muted-foreground")}>
                {bucket.hint} ({count.toLocaleString("ar-SA")})
              </span>
            </span>
          </Link>
        );
      })}

    </nav>
  );
}
