import Link from "next/link";

import { IconFootprints, IconCoffee, IconArmchair } from "@/lib/icons";
import { cn } from "@/lib/utils";

import { buildArchiveHref, type ArchiveState } from "../../helpers/build-archive-href";
import { FOCUS_RING } from "../../helpers/focus-ring";
import { READING_TIME_BUCKETS, type ReadingTimeBucket } from "../../helpers/reading-time-buckets";

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
    <nav aria-label="اقرأ حسب وقتك" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 scrollbar-none">
      {READING_TIME_BUCKETS.map((bucket) => {
        const Icon = ICONS[bucket.key];
        const tone = TONES[bucket.key];
        const count = counts[bucket.key];
        const active = current.time === bucket.key;

        return (
          <Link
            key={bucket.key}
            // A clean state, not `current`: time is its own axis, so it never carries the
            // field, category, tag or search along with it.
            href={buildArchiveHref(active ? {} : { time: bucket.key })}
            aria-current={active ? "true" : undefined}
            className={cn(
              "flex min-h-11 flex-1 shrink-0 items-center gap-2 rounded-lg px-3 py-2 ring-1 transition-colors active:scale-[0.98] min-[1240px]:min-h-9 " + FOCUS_RING,
              active ? tone.on : "bg-card ring-border hover:ring-primary/40"
            )}
          >
            <Icon className={cn("size-5 shrink-0", active ? "" : tone.icon)} aria-hidden />
            <span className="min-w-0 text-start leading-tight">
              <span className={cn("block whitespace-nowrap text-[13px] font-bold", active ? "" : "text-foreground")}>
                {bucket.label}
              </span>
              <span className={cn("block whitespace-nowrap text-[10px]", active ? "opacity-80" : "text-muted-foreground")}>
                {bucket.hint} · {count.toLocaleString("ar-SA")}
              </span>
            </span>
          </Link>
        );
      })}

    </nav>
  );
}
