import Link from "next/link";

import { IconFootprints, IconCoffee, IconArmchair } from "@/lib/icons";
import { cn } from "@/lib/utils";

import { withArchiveChange, type ArchiveState } from "../../helpers/build-archive-href";
import { FOCUS_RING } from "../../helpers/focus-ring";
import { READING_TIME_BUCKETS, type ReadingTimeBucket } from "../../helpers/reading-time-buckets";

import type { ComponentType, SVGProps } from "react";

const ICONS: Record<ReadingTimeBucket, ComponentType<SVGProps<SVGSVGElement>>> = {
  short: IconFootprints,
  medium: IconCoffee,
  long: IconArmchair,
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
 * describes the article, not the partner who paid for it — unlike the most-read list and the tag
 * cloud that stood here before and both ranked partners against each other.
 *
 * A bucket with nothing in it is drawn dimmed rather than hidden: a button that appears and
 * disappears while you filter is harder to trust than one that says "not here".
 */
export function ReadingTimeBar({ counts, current }: ReadingTimeBarProps) {
  const total = counts.short + counts.medium + counts.long;
  if (total === 0) return null;

  return (
    <nav aria-label="اقرأ حسب وقتك" className="flex flex-wrap gap-2">
      {READING_TIME_BUCKETS.map((bucket) => {
        const Icon = ICONS[bucket.key];
        const count = counts[bucket.key];
        const active = current.time === bucket.key;

        const inner = (
          <>
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="text-sm">{bucket.label}</span>
            <span className="text-[11px] opacity-70">{bucket.hint}</span>
          </>
        );

        if (count === 0) {
          return (
            <span
              key={bucket.key}
              aria-disabled="true"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-dashed border-border px-3 text-muted-foreground opacity-45"
            >
              {inner}
            </span>
          );
        }

        return (
          <Link
            key={bucket.key}
            href={withArchiveChange(current, { time: active ? undefined : bucket.key })}
            aria-current={active ? "true" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-lg px-3 ring-1 transition-colors active:scale-[0.98] " + FOCUS_RING,
              active
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-card text-muted-foreground ring-border hover:text-foreground hover:ring-primary/40"
            )}
          >
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}
