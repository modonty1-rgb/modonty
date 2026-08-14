import { Suspense } from "react";
import { LeftSidebar } from "@/app/home-components/LeftSidebar/LeftSidebar";
import { RightSidebar } from "@/app/home-components/RightSidebar/RightSidebar";
import { LeftSidebarSkeleton, RightSidebarSkeleton } from "@/app/home-components/SidebarSkeletons";
import { FeedDeferredUI } from "@/app/home-components/feed/FeedDeferredUI";
import { CategoryFeedSection } from "@/app/home-components/feed/CategoryFeedSection";
import { InfiniteFeedSkeleton } from "@/components/feed/infiniteScroll/InfiniteFeedSkeleton";
import { IndustryCarousel } from "@/app/home-components/feed/IndustryCarousel";
import { ReelsPreviewCard } from "@/app/home-components/feed/ReelsPreviewCard";
import { MobileClientTrustCard } from "@/app/home-components/feed/MobileClientGateway";
import { MobileModontyPublisherCard } from "@/app/home-components/feed/MobileModontyPublisherCard";
import type { FeedPost } from "@/lib/types";
import type { ReelPreviewItem } from "@/app/home-components/feed/ReelsPreviewCard";

interface FeedContainerProps {
  posts: FeedPost[];
  corePublisherArticles: FeedPost[];
  brandLogoUrl: string | null;
  industries: Array<{ id: string; name: string; slug: string; clientCount: number; socialImage?: string | null }>;
  reels: ReelPreviewItem[];
  clientServices: Array<{ id: string; label: string; visual: "booking" | "shop" }>;
}

export function FeedContainer({ posts, corePublisherArticles, brandLogoUrl, industries, reels, clientServices }: FeedContainerProps) {
  return (
    <>
      <FeedDeferredUI />
      <h2 className="sr-only">أحدث المقالات والمدونات - مدونتي</h2>
      <div className="container mx-auto max-w-[1280px] px-3 py-3 sm:px-4 sm:py-6">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:justify-center min-[1240px]:gap-4 min-[1296px]:gap-6">
          <Suspense fallback={<LeftSidebarSkeleton />}>
            <LeftSidebar reels={reels} />
          </Suspense>
          <div className="mx-auto w-full space-y-3 pb-20 sm:space-y-4 md:max-w-[600px] md:pb-0 lg:mx-0 lg:flex-1 min-[1240px]:max-w-[560px] min-[1296px]:max-w-[600px] [&>article:first-of-type]:!mt-0">
            <IndustryCarousel industries={industries} />
            <div className="lg:hidden">
              <ReelsPreviewCard items={reels} layout="feed" />
            </div>
            <div className="lg:hidden">
              <MobileModontyPublisherCard articles={corePublisherArticles} brandLogoUrl={brandLogoUrl} />
            </div>
            <div className="lg:hidden">
              <MobileClientTrustCard />
            </div>
            <section aria-labelledby="articles-feed-heading" className="space-y-3 sm:space-y-4 [&>*:nth-child(2)]:!mt-0">
              <h2 id="articles-feed-heading" className="sr-only">
                آخر المقالات
              </h2>
              <Suspense fallback={<InfiniteFeedSkeleton count={3} />}>
                <CategoryFeedSection serverPosts={posts} />
              </Suspense>
            </section>
          </div>
          <Suspense fallback={<RightSidebarSkeleton />}>
            <RightSidebar articles={corePublisherArticles} brandLogoUrl={brandLogoUrl} clientServices={clientServices} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
