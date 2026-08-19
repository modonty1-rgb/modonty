import Link from "next/link";

import { IconFootprints, IconCoffee, IconArmchair } from "@/lib/icons";
import { cn } from "@/lib/utils";

import { AskModo } from "../ask-modo/AskModo";
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
 * The top strip: pick how long a read you want, or go straight to Modo.
 *
 * Stripped down twice on Khalid's call (2026-08-19). The card frame, the heading and the number
 * on every button are gone — «شيل Counters وشيل الديف الرئيسي… خليه بس buttons بشكل أنيق». The
 * counts were guarding against a click that leads nowhere, and that cannot happen here: a bucket
 * with no articles is still drawn, but dimmed and unclickable.
 *
 * Modo's row is the component the homepage uses, unchanged — same character, same pill, same
 * behaviour, so the two pages feel like one product.
 */
export function ReadingTimeBar({ counts, current }: ReadingTimeBarProps) {
  const total = counts.short + counts.medium + counts.long;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      {total > 0 && (
        /* Same 72px height and 8px radius as Modo's row, measured off it — two controls sharing a
           line read as one strip only if they share a silhouette. Each button carries its range
           under its name, because «فنجان قهوة» alone says nothing about what it filters. */
        <nav aria-label="اقرأ حسب وقتك" className="flex shrink-0 flex-wrap gap-2">
          {READING_TIME_BUCKETS.map((bucket) => {
            const Icon = ICONS[bucket.key];
            const count = counts[bucket.key];
            const active = current.time === bucket.key;

            const inner = (
              <>
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0 text-start">
                  <span className="block text-sm font-medium leading-5">{bucket.label}</span>
                  <span className="block text-[11px] leading-4 opacity-70">{bucket.hint}</span>
                </span>
              </>
            );

            if (count === 0) {
              return (
                <span
                  key={bucket.key}
                  aria-disabled="true"
                  className="inline-flex h-[72px] items-center gap-2 rounded-lg border border-dashed border-border px-4 text-muted-foreground opacity-45"
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
                  "inline-flex h-[72px] items-center gap-2 rounded-lg px-4 ring-1 transition-colors active:scale-[0.98] " + FOCUS_RING,
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
      )}

      <div className="min-w-0 flex-1">
        <AskModo />
      </div>
    </div>
  );
}
