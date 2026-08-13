import { Suspense } from "react";
import { LeftSidebar } from "@/components/layout/LeftSidebar/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar/RightSidebar";
import { LeftSidebarSkeleton, RightSidebarSkeleton } from "@/components/layout/SidebarSkeletons";
import { FeedDeferredUI } from "@/components/feed/FeedDeferredUI";
import { CategoryFeedSection } from "@/components/feed/CategoryFeedSection";
import { InfiniteFeedSkeleton } from "@/components/feed/infiniteScroll/InfiniteFeedSkeleton";
import { IndustryCarousel } from "@/components/feed/IndustryCarousel";
import { ReelsPreviewCard } from "@/components/feed/ReelsPreviewCard";
import { HomeUserProfileCard } from "@/components/feed/HomeUserProfileCard";
import { MobileModontyPublisherCard } from "@/components/feed/MobileModontyPublisherCard";
import { ModoPrompt } from "@/components/feed/ModoPrompt";
import type { FeedPost } from "@/lib/types";
import type { ReelPreviewItem } from "@/components/feed/ReelsPreviewCard";

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
      <div className="container mx-auto max-w-[1280px] px-4 py-6">
        <div className="flex flex-col items-start gap-6 lg:flex-row">
          <Suspense fallback={<LeftSidebarSkeleton />}>
            <LeftSidebar reels={reels} />
          </Suspense>
          <div className="w-full lg:flex-1 lg:max-w-[600px] space-y-4 pb-20 md:pb-0 [&>article:first-of-type]:!mt-0">
            <IndustryCarousel industries={industries} />
            <div className="lg:hidden">
              <ReelsPreviewCard items={reels} layout="feed" />
            </div>
            <div className="lg:hidden">
              <MobileModontyPublisherCard articles={corePublisherArticles} brandLogoUrl={brandLogoUrl} />
            </div>
            <section aria-labelledby="articles-feed-heading" className="space-y-4 [&>*:nth-child(2)]:!mt-0">
              <h2 id="articles-feed-heading" className="sr-only">
                آخر المقالات
              </h2>
              <Suspense fallback={<InfiniteFeedSkeleton count={3} />}>
                <CategoryFeedSection
                  serverPosts={posts}
                  mobileModoSlot={<div className="lg:hidden"><ModoPrompt /></div>}
                  mobileProfileSlot={<div className="lg:hidden"><HomeUserProfileCard /></div>}
                />
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
