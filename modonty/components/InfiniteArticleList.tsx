"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PostCard } from "@/components/PostCard";
import { PostCardSkeleton } from "@/components/PostCardSkeleton";
import { loadMoreArticles } from "@/app/actions/article-actions";
import { Loader2, AlertCircle, RefreshCw, Search, Tag, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "@/components/link";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  slug: string;
  publishedAt: Date;
  clientName: string;
  clientSlug: string;
  clientLogo?: string;
  author: {
    id: string;
    name: string;
    title: string;
    company: string;
    avatar: string;
  };
  likes: number;
  dislikes: number;
  comments: number;
  favorites: number;
  status: "published" | "draft";
}

interface InfiniteArticleListProps {
  initialPosts: Post[];
}

export function InfiniteArticleList({ initialPosts }: InfiniteArticleListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(false);
    try {
      const nextPage = page + 1;
      const result = await loadMoreArticles(nextPage);

      if (result.articles.length > 0) {
        setPosts((prev) => [...prev, ...result.articles]);
        setPage(nextPage);
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  const handleRetry = () => {
    setError(false);
    loadMore();
  };

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadMore]);

  return (
    <>
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <div
            key={post.id}
            className="animate-in fade-in duration-300"
          >
            <PostCard post={post} priority={index === 0} />
          </div>
        ))
      ) : (
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
      )}

      <div ref={sentinelRef} className="w-full py-8">
        {loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">
                جاري تحميل المزيد... (شاهدت {posts.length} مقالة)
              </span>
            </div>
            <PostCardSkeleton count={3} />
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
              شاهدت جميع الـ {posts.length} مقالة المتاحة
            </p>
          </div>
        )}
      </div>
    </>
  );
}
