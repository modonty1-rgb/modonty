"use client";

import dynamic from "next/dynamic";

/**
 * Text size and hiding images are conveniences the reader reaches for, never something a
 * crawler reads — so the bundle waits until the page is up.
 *
 * The placeholder is the compact variant's exact box (32px controls in a 1px-padded pill), so
 * the outline bar it rides does not change height when the real controls arrive.
 */
export const ReadingTools = dynamic(
  () => import("./ReadingTools").then((m) => ({ default: m.ReadingTools })),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-10 w-[104px] shrink-0 animate-pulse rounded-xl border border-primary/30 bg-primary/5"
        aria-hidden
      />
    ),
  }
);
