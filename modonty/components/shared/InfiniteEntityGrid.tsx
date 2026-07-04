"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { EntityCard, type EntityCardProps } from "@/components/shared/EntityCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { IconLoading, IconError, IconRefresh } from "@/lib/icons";

interface InfiniteEntityGridProps {
  initialItems: EntityCardProps[];
  initialHasMore: boolean;
  loadMoreAction: (page: number) => Promise<{ items: EntityCardProps[]; hasMore: boolean }>;
  columns: 3 | 4;
  emptyState: React.ReactNode;
}

const COLUMN_CLASS: Record<3 | 4, string> = {
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-md">
      <Skeleton className="w-full rounded-none" style={{ aspectRatio: "16/10" }} />
      <div className="p-4">
        <Skeleton className="mb-3 h-5 w-3/4" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function InfiniteEntityGrid({
  initialItems,
  initialHasMore,
  loadMoreAction,
  columns,
  emptyState,
}: InfiniteEntityGridProps) {
  const searchParams = useSearchParams();
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [error, setError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setError(false);
    const nextPage = page + 1;

    try {
      const result = await loadMoreAction(nextPage);
      if (result.items.length > 0) {
        setItems((prev) => {
          const seen = new Set(prev.map((p) => p.slug));
          const fresh = result.items.filter((i) => !seen.has(i.slug));
          return fresh.length > 0 ? [...prev, ...fresh] : prev;
        });
        setPage(nextPage);
        setHasMore(result.hasMore);
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(nextPage));
        window.history.pushState(null, "", `?${params.toString()}`);
      } else {
        setHasMore(false);
      }
    } catch {
      setError(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore, page, loadMoreAction, searchParams]);

  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMoreRef.current();
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  if (items.length === 0 && !loading) return <>{emptyState}</>;

  return (
    <>
      <div className={`grid grid-cols-1 gap-4 ${COLUMN_CLASS[columns]}`}>
        {items.map((item, i) => (
          <EntityCard key={item.slug} {...item} preload={i < 4} />
        ))}
      </div>

      <div ref={sentinelRef} className="w-full py-8">
        {loading && (
          <>
            <div className="mb-6 flex items-center justify-center gap-2 text-muted-foreground">
              <IconLoading className="h-5 w-5 animate-spin" />
              <span className="text-sm">جاري تحميل المزيد...</span>
            </div>
            <div className={`grid grid-cols-1 gap-4 ${COLUMN_CLASS[columns]}`}>
              {Array.from({ length: columns }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex items-center gap-2 text-destructive">
              <IconError className="h-5 w-5" />
              <p className="font-medium">حدث خطأ أثناء تحميل المزيد</p>
            </div>
            <Button onClick={loadMore} variant="outline" className="gap-2">
              <IconRefresh className="h-4 w-4" />
              إعادة المحاولة
            </Button>
          </div>
        )}

        {!hasMore && !loading && !error && items.length > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            🎉 شاهدت الكل ({items.length})
          </p>
        )}
      </div>
    </>
  );
}
