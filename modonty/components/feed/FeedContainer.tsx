import { Suspense } from "react";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { LeftSidebarSkeleton, RightSidebarSkeleton } from "@/components/layout/SidebarSkeletons";
import { FeedDeferredUI } from "@/components/feed/FeedDeferredUI";
import { PostCard } from "@/components/feed/postcard/PostCard";
import { InfiniteArticleListOnView } from "@/components/feed/infiniteScroll/InfiniteArticleListOnView";
import type { FeedPost } from "@/lib/types";

interface FeedContainerProps {
  posts: FeedPost[];
  currentCategorySlug?: string;
  initialPage?: number;
  platformTagline?: string | null;
  platformDescription?: string | null;
}

export function FeedContainer({ posts, currentCategorySlug, initialPage = 1, platformTagline, platformDescription }: FeedContainerProps) {
  return (
    <>
      <FeedDeferredUI />
      <h2 className="sr-only">أحدث المقالات والمدونات - مودونتي</h2>
      <div className="container mx-auto max-w-[1128px] px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <Suspense fallback={<LeftSidebarSkeleton />}>
            <LeftSidebar currentCategorySlug={currentCategorySlug} />
          </Suspense>
          <div className="w-full lg:flex-1 lg:max-w-[600px] space-y-4 pb-20 md:pb-0 [&>article:first-of-type]:!mt-0">
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 border-t-2 border-t-accent">
              <p className="text-sm font-semibold text-foreground">{platformTagline ?? "مرحباً بك في مودونتي"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{platformDescription ?? "منصة المحتوى العربي — اكتشف مقالات من خبراء ومتخصصين في مجالات متنوعة."}</p>
            </div>
            <section aria-labelledby="articles-feed-heading" className="space-y-4 [&>*:nth-child(2)]:!mt-0">
              <h2 id="articles-feed-heading" className="sr-only">
                آخر المقالات
              </h2>
              {posts.length > 0 && (
                <div className="space-y-4">
                  {posts.map((post, index) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      index={index}
                      className="animate-in fade-in duration-300"
                    />
                  ))}
                </div>
              )}
              <InfiniteArticleListOnView
                initialStartIndex={posts.length}
                categorySlug={currentCategorySlug}
                initialPage={initialPage}
              />
            </section>
          </div>
          <Suspense fallback={<RightSidebarSkeleton />}>
            <RightSidebar />
          </Suspense>
        </div>
      </div>
    </>
  );
}
