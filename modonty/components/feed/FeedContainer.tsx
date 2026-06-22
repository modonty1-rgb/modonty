import { Suspense } from "react";
import { LeftSidebar } from "@/components/layout/LeftSidebar/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar/RightSidebar";
import { LeftSidebarSkeleton, RightSidebarSkeleton } from "@/components/layout/SidebarSkeletons";
import { FeedDeferredUI } from "@/components/feed/FeedDeferredUI";
import { CategoryFeedSection } from "@/components/feed/CategoryFeedSection";
import { InfiniteFeedSkeleton } from "@/components/feed/infiniteScroll/InfiniteFeedSkeleton";
import { FeedTopBanner } from "@/components/feed/FeedTopBanner";
import type { FeedPost } from "@/lib/types";
import type { SocialLink } from "@/lib/settings/get-platform-social-links";

interface FeedContainerProps {
  posts: FeedPost[];
  platformTagline?: string | null;
  platformDescription?: string | null;
  socialLinks: SocialLink[];
}

export function FeedContainer({ posts, platformTagline, platformDescription, socialLinks }: FeedContainerProps) {
  return (
    <>
      <FeedDeferredUI />
      <h2 className="sr-only">أحدث المقالات والمدونات - مدونتي</h2>
      <div className="container mx-auto max-w-[1128px] px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <Suspense fallback={<LeftSidebarSkeleton />}>
            <LeftSidebar />
          </Suspense>
          <div className="w-full lg:flex-1 lg:max-w-[600px] space-y-4 pb-20 md:pb-0 [&>article:first-of-type]:!mt-0">
            <FeedTopBanner
              platformTagline={platformTagline}
              platformDescription={platformDescription}
              socialLinks={socialLinks}
            />
            <section aria-labelledby="articles-feed-heading" className="space-y-4 [&>*:nth-child(2)]:!mt-0">
              <h2 id="articles-feed-heading" className="sr-only">
                آخر المقالات
              </h2>
              <Suspense fallback={<InfiniteFeedSkeleton count={3} />}>
                <CategoryFeedSection serverPosts={posts} />
              </Suspense>
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
