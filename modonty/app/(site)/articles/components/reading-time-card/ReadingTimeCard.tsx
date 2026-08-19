import Link from "next/link";

import { IconClock } from "@/lib/icons";
import { cn } from "@/lib/utils";

import { withArchiveChange, type ArchiveState } from "../../helpers/build-archive-href";
import {
  READING_TIME_BUCKETS,
  type ReadingTimeBucket,
} from "../../helpers/reading-time-buckets";

interface ReadingTimeCardProps {
  counts: Record<ReadingTimeBucket, number>;
  current: ArchiveState;
}

/**
 * «عندك كم دقيقة؟» — the one thing this rail can offer that belongs to nobody.
 *
 * The two things that stood here before were removed for the same reason: a most-read list and a
 * tag cloud both rank partners against each other, and a rail fixed on every archive page speaks
 * in the platform's voice. Time is neutral — it describes the article, not who paid for it.
 *
 * It is also a question no other page on the site answers, and one visitors genuinely have: the
 * reader with five minutes in a queue is not the reader on a sofa. `readingTimeMinutes` is filled
 * on all 117 published articles (measured 2026-08-19), so no bucket is ever a guess.
 *
 * A bucket with nothing in it is drawn dimmed and unclickable rather than hidden — a button that
 * appears and disappears as you filter is harder to trust than one that says "not here".
 */
export function ReadingTimeCard({ counts, current }: ReadingTimeCardProps) {
  const total = counts.short + counts.medium + counts.long;
  if (total === 0) return null;

  return (
    <section aria-labelledby="reading-time-heading" className="rounded-xl border border-border bg-card p-3">
      <h2 id="reading-time-heading" className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
        <IconClock className="h-4 w-4 text-primary" aria-hidden />
        عندك كم دقيقة؟
      </h2>

      <div className="space-y-1.5">
        {READING_TIME_BUCKETS.map((bucket) => {
          const count = counts[bucket.key];
          const active = current.time === bucket.key;

          if (count === 0) {
            return (
              <div
                key={bucket.key}
                aria-disabled="true"
                className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-border px-2.5 py-2 opacity-45"
              >
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-muted-foreground">{bucket.label}</span>
                  <span className="block text-[11px] text-muted-foreground">{bucket.hint}</span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">٠</span>
              </div>
            );
          }

          return (
            <Link
              key={bucket.key}
              href={withArchiveChange(current, { time: active ? undefined : bucket.key })}
              aria-current={active ? "true" : undefined}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 transition-colors",
                active
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/40 hover:bg-muted/40"
              )}
            >
              <span className="min-w-0">
                <span className={cn("block text-xs font-medium", active ? "text-primary" : "text-foreground")}>
                  {bucket.label}
                </span>
                <span className="block text-[11px] text-muted-foreground">{bucket.hint}</span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-1.5 text-xs tabular-nums",
                  active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {count.toLocaleString("ar-SA")}
              </span>
            </Link>
          );
        })}
      </div>

      {current.time && (
        <Link
          href={withArchiveChange(current, { time: undefined })}
          className="mt-2 inline-block text-xs font-medium text-link hover:underline"
        >
          اعرض كل الأطوال
        </Link>
      )}
    </section>
  );
}
