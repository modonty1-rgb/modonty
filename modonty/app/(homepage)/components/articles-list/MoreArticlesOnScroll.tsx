"use client";

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

  return (
    <div ref={ref}>
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
