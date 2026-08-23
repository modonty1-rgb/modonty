"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { useMountOnApproach } from "@modonty/shared/components/use-mount-on-approach";

import type { FeedView } from "./feed-views";

const MoreModontyArticles = dynamic(
  () => import("./MoreModontyArticles").then((m) => m.MoreModontyArticles),
  { ssr: false },
);

interface MoreModontyArticlesOnScrollProps {
  clientSlug: string;
  startIndex: number;
  initialPage: number;
  /** Route the chunks mirror onto — a STRING, because a function cannot cross into a
      Client Component. It already carries the active view, so `?page=N` is appended to it. */
  basePath: string;
  /** The active view — the endpoint must sort and filter the same way the page did. */
  view: FeedView;
}

/**
 * The gate. The engine and its card tree are not downloaded until the reader gets within
 * reach of the end of the list — same pattern the homepage and the archive use. A reader
 * who opens `/modonty`, reads the first card and leaves pays for none of it.
 */
export function MoreModontyArticlesOnScroll({
  clientSlug,
  startIndex,
  initialPage,
  basePath,
  view,
}: MoreModontyArticlesOnScrollProps) {
  const { ref, mounted } = useMountOnApproach();
  // Set only in the browser, never in the server render. That is the whole point: the CSS
  // rule keyed off this attribute hides the prev/next links for a reader whose scroll is
  // actually running, and leaves them visible for a crawler and for anyone with JavaScript
  // off — the two audiences that still need them (Khalid, 22 Aug: «how come, while all
  // showed» — the links were still offering «الصفحة التالية» under «خلصت مقالات مدونتي»).
  const [live, setLive] = useState(false);
  useEffect(() => setLive(true), []);

  return (
    <div ref={ref} {...(live ? { "data-infinite-live": "" } : {})}>
      {mounted ? (
        <MoreModontyArticles
          clientSlug={clientSlug}
          startIndex={startIndex}
          initialPage={initialPage}
          basePath={basePath}
          view={view}
        />
      ) : null}
    </div>
  );
}
