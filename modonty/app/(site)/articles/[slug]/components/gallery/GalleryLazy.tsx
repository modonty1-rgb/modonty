"use client";

import dynamic from "next/dynamic";

/**
 * The gallery is interaction, not content: its images already live in the article's HTML and in
 * the image sitemap, so nothing a crawler needs depends on this bundle. It sits far below the
 * fold, behind a section the reader opens — so it has no business in the first load.
 *
 * The placeholder holds the card's real height, so opening the section does not shift the page.
 */
export const Gallery = dynamic(
  () => import("./Gallery").then((m) => ({ default: m.Gallery })),
  {
    ssr: false,
    loading: () => (
      <div className="overflow-hidden rounded-xl border border-border" aria-hidden>
        <div className="h-10 border-b border-border bg-muted/40" />
        <div className="p-3">
          <div className="aspect-video w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    ),
  }
);
