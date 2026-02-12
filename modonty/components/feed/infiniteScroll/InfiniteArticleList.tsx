"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PostCard } from "@/components/feed/postcard/PostCard";
import { InfiniteFeedSkeleton } from "@/components/feed/infiniteScroll/InfiniteFeedSkeleton";
import { loadMoreArticles } from "@/app/actions/article-actions";
import { Loader2, AlertCircle, RefreshCw, Search, Tag, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "@/components/link";
import type { FeedPost } from "@/lib/types";

interface InfiniteArticleListProps {
  initialPosts: FeedPost[];
  initialStartIndex?: number;
  categorySlug?: string;
}

export function InfiniteArticleList({
  initialPosts,
  initialStartIndex = 0,
  categorySlug,
}: InfiniteArticleListProps) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const ignoredRef = useRef(false);

  const totalSeen = initialStartIndex + posts.length;

  useEffect(() => {
    ignoredRef.current = false;
    return () => {
      ignoredRef.current = true;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(false);
    const nextPage = page + 1;
    const requestCategory = categorySlug;

    try {
      const result = await loadMoreArticles(nextPage, requestCategory);
      if (ignoredRef.current) return;
      if (requestCategory !== categorySlug) return;
      if (result.articles.length > 0) {
        setPosts((prev) => [...prev, ...result.articles]);
        setPage(nextPage);
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch {
      if (!ignoredRef.current) setError(true);
    } finally {
      if (!ignoredRef.current) setLoading(false);
    }
  }, [loading, hasMore, page, categorySlug]);

  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  useEffect(() => {
    ignoredRef.current = false;
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(false);
  }, [categorySlug]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        loadMoreRef.current();
      },
      { root: null, rootMargin: "100px", threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleRetry = () => {
    setError(false);
    loadMore();
  };

  const showEmptyState = posts.length === 0 && initialStartIndex === 0;

  return (
    <>
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              index={initialStartIndex + index}
              className="animate-in fade-in duration-300"
            />
          ))}
        </div>
      ) : showEmptyState ? (
        <div className="text-center py-16 px-4">
          <div className="max-w-md mx-auto space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">لا توجد مقالات متاحة حالياً</h3>
              <p className="text-sm text-muted-foreground">
                جرّب استكشاف المحتوى بطرق أخرى
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="default" className="gap-2">
                <Link href="/categories">
                  <Tag className="h-4 w-4" />
                  تصفح الفئات
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/clients">
                  <Rss className="h-4 w-4" />
                  استكشف العملاء
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div ref={sentinelRef} className="w-full py-8">
        {loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">
                جاري تحميل المزيد... (شاهدت {totalSeen} مقالة)
              </span>
            </div>
            <InfiniteFeedSkeleton count={3} />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">حدث خطأ في تحميل المقالات</p>
            </div>
            <Button
              onClick={handleRetry}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </Button>
          </div>
        )}

        {!hasMore && !loading && !error && posts.length > 0 && (
          <div className="text-center py-8 space-y-2 animate-in fade-in duration-300">
            <p className="text-muted-foreground text-sm font-medium">
              🎉 لقد وصلت إلى النهاية!
            </p>
            <p className="text-xs text-muted-foreground">
              شاهدت جميع الـ {totalSeen} مقالة المتاحة
            </p>
          </div>
        )}
      </div>
    </>
  );
}
