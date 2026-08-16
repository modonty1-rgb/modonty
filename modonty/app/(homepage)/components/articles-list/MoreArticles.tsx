"use client";

import Link from "next/link";

import { PostCard } from "@/components/feed/postcard/PostCard";
import { InfiniteFeedSkeleton } from "@/components/feed/infiniteScroll/InfiniteFeedSkeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  IconLoading,
  IconError,
  IconRefresh,
  IconSearch,
  IconCategory,
  IconFeed,
} from "@/lib/icons";
import { InfiniteList } from "@modonty/shared/components/infinite-list";
import type { InfiniteListPage } from "@modonty/shared/components/infinite-list";
import type { FeedPost } from "@/lib/types";

// Reads go through the GET endpoint, not a Server Action. Next.js dispatches
// Server Actions one at a time per client (server-actions.mdx), so a scroll fetch
// through an action would queue behind — and block — every other action on the page.
// Same endpoint the mobile app will call; publishedAt arrives as an ISO string.
async function fetchMoreArticles(page: number): Promise<InfiniteListPage<FeedPost>> {
  const response = await fetch(`/api/articles?page=${page}`);
  if (!response.ok) throw new Error(`articles endpoint returned ${response.status}`);

  const result = (await response.json()) as { articles: FeedPost[]; hasMore: boolean };
  return {
    hasMore: result.hasMore,
    items: result.articles.map((article) => ({
      ...article,
      publishedAt: new Date(article.publishedAt),
    })),
  };
}

interface MoreArticlesProps {
  initialPosts: FeedPost[];
  initialStartIndex?: number;
  initialPage?: number;
}

// The feed skin over the shared engine: this file owns what the visitor sees
// (cards, strings, empty/error states); the engine owns the machine (observer,
// dedup, pushState). Google's series contract — /page/n twins + prev/next links —
// is the ROUTE's job; see the engine's header comment.
export function MoreArticles({
  initialPosts,
  initialStartIndex = 0,
  initialPage = 1,
}: MoreArticlesProps) {
  return (
    <InfiniteList<FeedPost>
      initialItems={initialPosts}
      initialPage={initialPage}
      startIndex={initialStartIndex}
      fetchPage={fetchMoreArticles}
      getKey={(post) => post.id}
      pageUrl={(page) => `/page/${page}`}
      renderItem={(post, index) => (
        <PostCard
          post={post}
          index={index}
          isLcp={index === 0}
          className="animate-in fade-in duration-300"
        />
      )}
      renderLoading={(seenCount) => (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
            <IconLoading className="h-5 w-5 animate-spin" />
            <span className="text-sm">
              نجيب لك المزيد… (شفت {seenCount} مقال)
            </span>
          </div>
          <InfiniteFeedSkeleton count={3} />
        </div>
      )}
      renderError={(retry) => (
        <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-destructive">
            <IconError className="h-5 w-5" />
            <p className="font-normal">ما قدرنا نجيب المقالات</p>
          </div>
          <Button onClick={retry} variant="outline" className="gap-2">
            <IconRefresh className="h-4 w-4" />
            جرّب مرة ثانية
          </Button>
        </div>
      )}
      renderEnd={(seenCount) => (
        <div className="text-center py-8 space-y-2 animate-in fade-in duration-300">
          <p className="text-muted-foreground text-sm font-normal">
            🎉 خلصت المقالات كلها!
          </p>
          <p className="text-xs text-muted-foreground">
            شفت كل الـ {seenCount} مقال اللي عندنا
          </p>
        </div>
      )}
      emptyState={
        <div className="text-center py-16 px-4">
          <div className="max-w-md mx-auto space-y-6">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <IconSearch className="h-12 w-12" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">ما فيه مقالات الحين</h3>
              <p className="text-sm text-muted-foreground">
                جرّب تتصفّح من مكان ثاني
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {/* buttonVariants, not <Button asChild> — Button sets role="button",
                  which overrides the anchor's link role. shadcn docs, "As Link". */}
              <Link href="/categories" className={buttonVariants({ variant: "default", className: "gap-2" })}>
                <IconCategory className="h-4 w-4" />
                تصفّح التصنيفات
              </Link>
              <Link href="/clients" className={buttonVariants({ variant: "outline", className: "gap-2" })}>
                <IconFeed className="h-4 w-4" />
                شوف الشركاء
              </Link>
            </div>
          </div>
        </div>
      }
    />
  );
}
