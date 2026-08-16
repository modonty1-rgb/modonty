import { LeftSidebar } from "@/app/(homepage)/components/left-sidebar/LeftSidebar";
import { RightSidebar } from "@/app/(homepage)/components/right-sidebar/RightSidebar";
import { ScrollButtons } from "@/app/(homepage)/components/scroll-buttons/ScrollButtons";
import { ArticlesList } from "@/app/(homepage)/components/articles-list/ArticlesList";
import { HomeActions } from "@/app/(homepage)/components/home-actions/HomeActions";
import { IndustriesCard } from "@/app/(homepage)/components/industries-card/IndustriesCard";
import { ReelsCard } from "@/app/(homepage)/components/reels-card/ReelsCard";
import { ClientsCardMobile } from "@/app/(homepage)/components/clients-card/ClientsCardMobile";
import { ModontyCardMobile } from "@/app/(homepage)/components/modonty-card/ModontyCardMobile";
import type { ReactNode } from "react";
import type { FeedPost } from "@/lib/types";
import type { ReelItem } from "@/app/(homepage)/components/reels-card/ReelsCard";

interface PageLayoutProps {
  posts: FeedPost[];
  /** Whether a chunk exists after `posts` — drives the crawlable «التالية» link. */
  hasMore: boolean;
  /** Chunk of the paginated series being shown: 1 = `/`, n = `/page/n`. */
  page: number;
  corePublisherArticles: FeedPost[];
  brandLogoUrl: string | null;
  industries: Array<{ id: string; name: string; slug: string; clientCount: number; socialImage?: string | null; description?: string | null }>;
  reels: ReelItem[];
  /** Per-request slot created outside the cached page (reads the session). Passed through, never read. */
  userCard: ReactNode;
}

export function PageLayout({ posts, hasMore, page, corePublisherArticles, brandLogoUrl, industries, reels, userCard }: PageLayoutProps) {
  const pageArabic = page.toLocaleString("ar-SA");
  return (
    <>
      <ScrollButtons />
      <h2 className="sr-only">أحدث المقالات والمدونات - مدونتي</h2>
      <div className="container mx-auto max-w-[1128px] px-3 py-3 sm:px-4 sm:py-6">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:justify-center min-[1240px]:gap-4 min-[1296px]:gap-6">
          {/* Columns swapped 2026-08-16 (Khalid): partners rail on the visual right, account rail on the left. */}
          <RightSidebar />
          <div className="mx-auto w-full space-y-3 pb-20 sm:space-y-4 md:max-w-[600px] md:pb-0 lg:mx-0 lg:flex-1 min-[1240px]:max-w-[560px] min-[1296px]:max-w-[600px] [&>article:first-of-type]:!mt-0">
            {/* Desktop: Modo leads the feed, followed by the booking and shopping card. Phones keep the
                industries row here — the rail is hidden there, and the bottom bar already
                carries the same three actions. */}
            <div className="hidden lg:block">
              <HomeActions />
            </div>
            <div className="lg:hidden">
              <IndustriesCard industries={industries} layout="row" />
            </div>
            {/* Reels left the desktop feed for a link card in the far rail (Khalid, 2026-08-16).
                Below 1240px that rail is hidden, so the reels stay here — otherwise phones
                and small laptops would lose them entirely (mobile pass is still pending). */}
            <div className="min-[1240px]:hidden">
              <ReelsCard items={reels} layout="feed" />
            </div>
            <div className="lg:hidden">
              <ModontyCardMobile articles={corePublisherArticles} brandLogoUrl={brandLogoUrl} />
            </div>
            <div className="lg:hidden">
              <ClientsCardMobile />
            </div>
            <section aria-labelledby="articles-feed-heading" className="space-y-3 sm:space-y-4 [&>*:nth-child(2)]:!mt-0">
              {/* Chunk n is its own page (own title + canonical), so its heading is the h1
                  and stays visible — a visitor who refreshed mid-scroll needs to see where
                  the feed resumes. `/` keeps its sr-only site h1 above this. */}
              {page > 1 ? (
                <h1 id="articles-feed-heading" className="text-base font-bold text-foreground">
                  آخر المقالات — الصفحة {pageArabic}
                </h1>
              ) : (
                <h2 id="articles-feed-heading" className="sr-only">
                  آخر المقالات
                </h2>
              )}
              <ArticlesList serverPosts={posts} page={page} />
              {/* Crawl entry into the paginated series (Google: "Link sequentially to
                  the individual URLs"). Sits below the infinite scroll, so the visitor
                  only meets it at the true bottom — or with JavaScript off. */}
              {(page > 1 || hasMore) && (
                <nav aria-label="تنقّل بين صفحات المقالات" className="flex items-center justify-between gap-3 border-t border-border pt-4">
                  {page > 1 ? (
                    <a href={page === 2 ? "/" : `/page/${page - 1}`} className="text-sm font-medium text-link hover:underline">
                      → الصفحة السابقة
                    </a>
                  ) : (
                    <span />
                  )}
                  {hasMore && (
                    <a href={`/page/${page + 1}`} className="text-sm font-medium text-link hover:underline">
                      الصفحة التالية ←
                    </a>
                  )}
                </nav>
              )}
            </section>
          </div>
          <LeftSidebar articles={corePublisherArticles} brandLogoUrl={brandLogoUrl} userCard={userCard} />
        </div>
      </div>
    </>
  );
}
