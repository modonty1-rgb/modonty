"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const InfiniteArticleList = dynamic(
  () =>
    import("@/components/feed/infiniteScroll/InfiniteArticleList").then(
      (mod) => mod.InfiniteArticleList
    ),
  {
    ssr: false,
  }
);

interface InfiniteArticleListOnViewProps {
  initialStartIndex: number;
  categorySlug?: string;
}

export function InfiniteArticleListOnView({
  initialStartIndex,
  categorySlug,
}: InfiniteArticleListOnViewProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current || shouldRender) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div ref={sentinelRef}>
      {shouldRender ? (
        <InfiniteArticleList
          initialPosts={[]}
          initialStartIndex={initialStartIndex}
          categorySlug={categorySlug}
        />
      ) : null}
    </div>
  );
}

