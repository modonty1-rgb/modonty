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
}

export function FeedContainer({ posts, currentCategorySlug }: FeedContainerProps) {

  return (
    <>
      <FeedDeferredUI />
      <h1 className="sr-only">أحدث المقالات والمدونات - مودونتي</h1>
      <div className="container mx-auto max-w-[1128px] px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <Suspense fallback={<LeftSidebarSkeleton />}>
            <LeftSidebar className="order-1 lg:order-1" currentCategorySlug={currentCategorySlug} />
          </Suspense>
          <div className="w-full lg:flex-1 lg:max-w-[600px] order-2 lg:order-2 space-y-4 pb-20 md:pb-0 [&>article:first-of-type]:!mt-0">
            <section aria-labelledby="articles-feed-heading" className="space-y-4">
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
              <InfiniteArticleListOnView initialStartIndex={posts.length} categorySlug={currentCategorySlug} />
            </section>
          </div>
          <Suspense fallback={<RightSidebarSkeleton />}>
            <RightSidebar className="order-3 lg:order-3" />
          </Suspense>
        </div>
      </div>
    </>
  );
}

