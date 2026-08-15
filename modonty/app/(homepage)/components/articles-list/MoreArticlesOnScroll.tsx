"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const MoreArticles = dynamic(
  () =>
    import("@/app/(homepage)/components/articles-list/MoreArticles").then(
      (mod) => mod.MoreArticles
    ),
  {
    ssr: false,
  }
);

interface MoreArticlesOnScrollProps {
  initialStartIndex: number;
  categorySlug?: string;
  initialPage?: number;
}

export function MoreArticlesOnScroll({
  initialStartIndex,
  categorySlug,
  initialPage = 1,
}: MoreArticlesOnScrollProps) {
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
        <MoreArticles
          initialPosts={[]}
          initialStartIndex={initialStartIndex}
          categorySlug={categorySlug}
          initialPage={initialPage}
        />
      ) : null}
    </div>
  );
}

