"use client";

import dynamic from "next/dynamic";

import { useMountOnApproach } from "@modonty/shared/components/use-mount-on-approach";

import type { ArchiveState } from "../../helpers/build-archive-href";

const MoreArticles = dynamic(() => import("./MoreArticles").then((m) => m.MoreArticles), {
  ssr: false,
});

interface MoreArticlesOnScrollProps {
  current: ArchiveState;
  startIndex: number;
  initialPage: number;
}

/**
 * The gate: the engine and its card tree are not downloaded until the visitor gets within reach of
 * the end of the list. Same pattern the homepage uses — an archive page that ships a scroll engine
 * to someone who came for the first three rows has paid for nothing.
 */
export function MoreArticlesOnScroll({ current, startIndex, initialPage }: MoreArticlesOnScrollProps) {
  const { ref, mounted } = useMountOnApproach();

  return (
    <div ref={ref}>
      {mounted ? (
        <MoreArticles current={current} startIndex={startIndex} initialPage={initialPage} />
      ) : null}
    </div>
  );
}
