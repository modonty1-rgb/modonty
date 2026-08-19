import Link from "next/link";

import { IconZap, IconCoffee, IconArmchair } from "@/lib/icons";
import { cn } from "@/lib/utils";

import { withArchiveChange, type ArchiveState } from "../../helpers/build-archive-href";
import { READING_TIME_BUCKETS, type ReadingTimeBucket } from "../../helpers/reading-time-buckets";

import type { ComponentType, SVGProps } from "react";

const ICONS: Record<ReadingTimeBucket, ComponentType<SVGProps<SVGSVGElement>>> = {
  short: IconZap,
  medium: IconCoffee,
  long: IconArmchair,
};

interface ReadingTimeBarProps {
  counts: Record<ReadingTimeBucket, number>;
  current: ArchiveState;
}

/**
 * «عندك كم دقيقة؟» — full width across the top of the archive, above the three columns.
 *
 * It started as a small box in the left rail. Khalid moved it up (2026-08-19): it is the first
 * question a reader answers before he picks a subject, so it belongs where the eye lands, not
 * beside the results.
 *
 * It is also the only axis on this page that belongs to nobody. The two things that stood in the
 * rail before it — a most-read list and a tag cloud — both ranked partners against each other, and
 * a strip fixed on every archive page speaks in the platform's voice. Time describes the article,
 * not who paid for it.
 *
 * A bucket with nothing in it is drawn dimmed and unclickable rather than hidden — a button that
 * appears and disappears while you filter is harder to trust than one that says "not here".
 */
export function ReadingTimeBar({ counts, current }: ReadingTimeBarProps) {
  const total = counts.short + counts.medium + counts.long;
  if (total === 0) return null;

  return (
    <section
      aria-labelledby="reading-time-heading"
      className="rounded-2xl border border-border bg-gradient-to-l from-primary/[0.07] via-card to-card p-4 sm:p-5"
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="reading-time-heading" className="text-base font-bold text-foreground sm:text-lg">
          عندك كم دقيقة؟
        </h2>
        <p className="text-xs text-muted-foreground">اختر على مزاجك، والباقي نرتّبه لك</p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-3">
        {READING_TIME_BUCKETS.map((bucket) => {
          const Icon = ICONS[bucket.key];
          const count = counts[bucket.key];
          const active = current.time === bucket.key;

          const body = (
            <>
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                  active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block text-sm font-bold", active ? "text-primary" : "text-foreground")}>
                  {bucket.label}
                </span>
                <span className="block text-xs text-muted-foreground">{bucket.hint}</span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                  active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {count.toLocaleString("ar-SA")}
              </span>
            </>
          );

          if (count === 0) {
            return (
              <div
                key={bucket.key}
                aria-disabled="true"
                className="flex items-center gap-3 rounded-xl border border-dashed border-border p-3 opacity-45"
              >
                {body}
              </div>
            );
          }

          return (
            <Link
              key={bucket.key}
              href={withArchiveChange(current, { time: active ? undefined : bucket.key })}
              aria-current={active ? "true" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 transition-all",
                active
                  ? "border-primary bg-primary/[0.08] shadow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
              )}
            >
              {body}
            </Link>
          );
        })}
      </div>

      {current.time && (
        <Link
          href={withArchiveChange(current, { time: undefined })}
          className="mt-3 inline-block text-xs font-medium text-link hover:underline"
        >
          اعرض كل الأطوال
        </Link>
      )}
    </section>
  );
}
