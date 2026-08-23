"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { useMountOnApproach } from "@modonty/shared/components/use-mount-on-approach";

const MoreArticles = dynamic(
  () => import("./MoreArticles").then((mod) => mod.MoreArticles),
  { ssr: false }
);

interface MoreArticlesOnScrollProps {
  initialStartIndex: number;
  initialPage?: number;
}

// Thin gate: the MoreArticles chunk (engine + PostCard tree) isn't downloaded
// until the visitor scrolls within 200px of the feed's end.
export function MoreArticlesOnScroll({
  initialStartIndex,
  initialPage = 1,
}: MoreArticlesOnScrollProps) {
  const { ref, mounted } = useMountOnApproach();
  // Browser-only flag, never in the server HTML: `section:has([data-infinite-live])
  // [data-feed-pagination]` (globals.css) hides the prev/next links for a reader whose
  // scroll is actually running, and leaves them for crawlers and no-JS readers. Same
  // pattern as `/modonty` (22 Aug) — the homepage was still showing «الصفحة التالية»
  // under a feed the scroll had already exhausted (measured 23 Aug: 100 cards loaded,
  // link still visible).
  const [live, setLive] = useState(false);
  useEffect(() => setLive(true), []);

  return (
    <div ref={ref} {...(live ? { "data-infinite-live": "" } : {})}>
      {mounted ? (
        <MoreArticles
          initialPosts={[]}
          initialStartIndex={initialStartIndex}
          initialPage={initialPage}
        />
      ) : null}
    </div>
  );
}
