import { LeftSidebar } from "@/app/(homepage)/components/left-sidebar/LeftSidebar";
import { RightSidebar } from "@/app/(homepage)/components/right-sidebar/RightSidebar";
import { ScrollButtons } from "@/app/(homepage)/components/scroll-buttons/ScrollButtons";
import { ArticlesList } from "@/app/(homepage)/components/articles-list/ArticlesList";
import { IndustriesCard } from "@/app/(homepage)/components/industries-card/IndustriesCard";
import { ReelsCard } from "@/app/(homepage)/components/reels-card/ReelsCard";
import { ClientsCardMobile } from "@/app/(homepage)/components/clients-card/ClientsCardMobile";
import { ModontyCardMobile } from "@/app/(homepage)/components/modonty-card/ModontyCardMobile";
import type { FeedPost } from "@/lib/types";
import type { ReelItem } from "@/app/(homepage)/components/reels-card/ReelsCard";

interface PageLayoutProps {
  posts: FeedPost[];
  corePublisherArticles: FeedPost[];
  brandLogoUrl: string | null;
  industries: Array<{ id: string; name: string; slug: string; clientCount: number; socialImage?: string | null }>;
  reels: ReelItem[];
  clientServices: Array<{ id: string; label: string; visual: "booking" | "shop" }>;
}

export function PageLayout({ posts, corePublisherArticles, brandLogoUrl, industries, reels, clientServices }: PageLayoutProps) {
  return (
    <>
      <ScrollButtons />
      <h2 className="sr-only">أحدث المقالات والمدونات - مدونتي</h2>
      <div className="container mx-auto max-w-[1280px] px-3 py-3 sm:px-4 sm:py-6">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:justify-center min-[1240px]:gap-4 min-[1296px]:gap-6">
          <LeftSidebar reels={reels} />
          <div className="mx-auto w-full space-y-3 pb-20 sm:space-y-4 md:max-w-[600px] md:pb-0 lg:mx-0 lg:flex-1 min-[1240px]:max-w-[560px] min-[1296px]:max-w-[600px] [&>article:first-of-type]:!mt-0">
            <IndustriesCard industries={industries} />
            <div className="lg:hidden">
              <ReelsCard items={reels} layout="feed" />
            </div>
            <div className="lg:hidden">
              <ModontyCardMobile articles={corePublisherArticles} brandLogoUrl={brandLogoUrl} />
            </div>
            <div className="lg:hidden">
              <ClientsCardMobile />
            </div>
            <section aria-labelledby="articles-feed-heading" className="space-y-3 sm:space-y-4 [&>*:nth-child(2)]:!mt-0">
              <h2 id="articles-feed-heading" className="sr-only">
                آخر المقالات
              </h2>
              <ArticlesList serverPosts={posts} />
            </section>
          </div>
          <RightSidebar articles={corePublisherArticles} brandLogoUrl={brandLogoUrl} clientServices={clientServices} />
        </div>
      </div>
    </>
  );
}
