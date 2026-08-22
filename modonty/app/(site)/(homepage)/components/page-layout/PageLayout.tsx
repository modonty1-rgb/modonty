import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";
import { LeftSidebar } from "@/app/(site)/(homepage)/components/left-sidebar/LeftSidebar";
import { RightSidebar } from "@/app/(site)/(homepage)/components/right-sidebar/RightSidebar";
import { ScrollButtons } from "@/app/(site)/(homepage)/components/scroll-buttons/ScrollButtons";
import { ArticlesList } from "@/app/(site)/(homepage)/components/articles-list/ArticlesList";
import { HomeActions } from "@/app/(site)/(homepage)/components/home-actions/HomeActions";
import { QuickLinks } from "@/app/(site)/(homepage)/components/quick-links/QuickLinks";
import { ReelsCard } from "@/components/shared/reels-card/ReelsCard";
import type { ReactNode } from "react";
import type { FeedPost } from "@/lib/types";
import type { ReelItem } from "@/components/shared/reels-card/ReelsCard";

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
      <ThreeColumnLayout
        // Columns swapped 2026-08-16 (Khalid): partners rail on the visual right, account rail on the left.
        right={<RightSidebar />}
        center={
          <div className="space-y-3 sm:space-y-4 [&>article:first-of-type]:!mt-0">
            {/* Mobile (<1024px): four doorway tabs hanging from the navbar itself — the
                article page's pattern (Khalid, 21 Aug 2026: «تجي نازلة من تحت الناف بار»).
                The negative margin cancels the shell container's top padding (py-3/sm:py-6)
                so the tabs sit flush on the navbar's bottom edge. They replaced the four
                stacked full-size cards (industries · reels · modonty · clients) that pushed
                the articles a full screen down. The card FILES stay — hiding is not deleting. */}
            <div className="-mt-3 sm:-mt-6 lg:hidden">
              <QuickLinks />
            </div>
            {/* Modo leads the feed — except on phones (<768px), where the bottom bar already
                carries him (Khalid, 21 Aug 2026: two Modo doors on one screen is one too many). */}
            <div className="max-md:hidden">
              <HomeActions />
            </div>
            {/* Reels left the desktop feed for a link card in the far rail (Khalid, 2026-08-16).
                In the 1024-1239px band that rail is hidden, so the card stays here for small
                laptops; phones now reach the reels through the QuickLinks tile instead. */}
            <div className="hidden lg:block min-[1240px]:hidden">
              <ReelsCard items={reels} layout="feed" />
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
                    <a href={page === 2 ? "/" : `/page/${page - 1}`} className="inline-flex items-center text-sm font-medium text-link hover:underline max-lg:min-h-11 max-lg:rounded-md max-lg:px-2">
                      → الصفحة السابقة
                    </a>
                  ) : (
                    <span />
                  )}
                  {hasMore && (
                    <a href={`/page/${page + 1}`} className="inline-flex items-center text-sm font-medium text-link hover:underline max-lg:min-h-11 max-lg:rounded-md max-lg:px-2">
                      الصفحة التالية ←
                    </a>
                  )}
                </nav>
              )}
            </section>
          </div>
        }
        left={<LeftSidebar articles={corePublisherArticles} brandLogoUrl={brandLogoUrl} userCard={userCard} />}
      />
    </>
  );
}
