import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";
import { LeftSidebar } from "@/app/(site)/(homepage)/components/left-sidebar/LeftSidebar";
import { RightSidebar } from "@/app/(site)/(homepage)/components/right-sidebar/RightSidebar";
import { ScrollButtons } from "@/app/(site)/(homepage)/components/scroll-buttons/ScrollButtons";
import { ArticlesList } from "@/app/(site)/(homepage)/components/articles-list/ArticlesList";
import { HomeActions } from "@/app/(site)/(homepage)/components/home-actions/HomeActions";
import { ReelsCard } from "@/components/shared/reels-card/ReelsCard";
import { FeedPagination } from "@/components/shared/pagination/FeedPagination";
import { ArchiveSearchForm } from "@/components/shared/archive-filters/ArchiveSearchForm";
import { ReadingTimeBar } from "@/components/shared/archive-filters/ReadingTimeBar";
import type { ReactNode } from "react";
import type { FeedPost } from "@/lib/types";
import type { ReelItem } from "@/components/shared/reels-card/ReelsCard";
import type { ReadingTimeBucket } from "@/lib/articles/archive/reading-time-buckets";

interface PageLayoutProps {
  posts: FeedPost[];
  /** Whether a chunk exists after `posts` — drives the crawlable «التالية» link. */
  hasMore: boolean;
  /** Chunk of the paginated series being shown: 1 = `/`, n = `/page/n`. */
  page: number;
  industries: Array<{ id: string; name: string; slug: string; clientCount: number; socialImage?: string | null; description?: string | null }>;
  reels: ReelItem[];
  /** Per-request slot created outside the cached page (reads the session). Passed through, never read. */
  userCard: ReactNode;
  /** Archive-wide counts per reading-time bucket — the phone's three filter tiles. */
  readingTimeCounts: Record<ReadingTimeBucket, number>;
}

export function PageLayout({ posts, hasMore, page, industries, reels, userCard, readingTimeCounts }: PageLayoutProps) {
  const pageArabic = page.toLocaleString("ar-SA");
  return (
    <>
      <ScrollButtons />
      {/* The sr-only «أحدث المقالات والمدونات» that used to sit here is gone: the feed now
          carries a real visible heading below, and two headings for one list would make a
          screen reader announce the section twice. */}
      <ThreeColumnLayout
        // Columns swapped 2026-08-16 (Khalid): partners rail on the visual right, account rail on the left.
        right={<RightSidebar />}
        center={
          <div className="space-y-3 sm:space-y-4 [&>article:first-of-type]:!mt-0">
            {/* A visible heading, not just the sr-only one in CachedHomePage. Measured 24 Aug:
                the page's only h1 was `sr-only` at 1×1px, so a sighted reader landed on a wall
                of cards with nothing naming where they are — the machine was told and the human
                was not. One line, above the feed, where the eye starts. It is an h2 because the
                page's h1 (the site name) already exists for the crawler; two h1s would compete. */}
            <h2 className="pt-1 text-[15px] font-bold leading-none text-foreground sm:text-base">
              أحدث المقالات
            </h2>
            {/* The doorway tabs moved to `SiteShell` on 22 Aug — they now hang from the
                navbar on every page, so the homepage no longer renders its own copy. */}
            {/* Modo leads the feed — except on phones (<768px), where the bottom bar already
                carries him (Khalid, 21 Aug 2026: two Modo doors on one screen is one too many). */}
            <div className="max-md:hidden">
              <HomeActions />
            </div>
            {/* The small-laptop reels card moved INTO the feed (after the second article) on
                24 Aug — see `ArticlesList`. Above the feed it delayed the opening article from
                y=225 to y=389 at 1100px, so the reader met reels before reading anything. */}
            {/* PHONE ONLY (Khalid, 23 Aug: «in home page need search and filter»): the archive's
                own two controls, promoted from `/articles` so there is one search box and one
                reading-time bar on the site. Search is a zero-JS GET form that lands on
                `/articles?search=…`; the tiles are plain links to `/articles?time=…`. The field
                axis is deliberately absent on phones (Khalid, 22–23 Aug: the «المجالات» tab is
                the field picker), exactly as on `/articles`. Desktop keeps its rails untouched. */}
            <div className="space-y-3 lg:hidden">
              <ArchiveSearchForm />
              <ReadingTimeBar counts={readingTimeCounts} current={{}} />
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
              <ArticlesList serverPosts={posts} page={page} reels={reels} />
              {/* Crawl entry into the paginated series (Google: "Link sequentially to
                  the individual URLs"). Sits below the infinite scroll, so the visitor
                  only meets it at the true bottom — or with JavaScript off. */}
              {/* The shared `FeedPagination` (promoted 22 Aug for exactly this nav — the
                  homepage had kept its own copy). `data-feed-pagination` is the handle the
                  globals.css rule uses to hide it while the infinite scroll is live, so the
                  links stop offering «الصفحة التالية» under an exhausted feed. */}
              <div data-feed-pagination>
                <FeedPagination
                  page={page}
                  hasMore={hasMore}
                  buildHref={(n) => (n === 1 ? "/" : `/page/${n}`)}
                  label="تنقّل بين صفحات المقالات"
                />
              </div>
            </section>
          </div>
        }
        left={<LeftSidebar userCard={userCard} />}
      />
    </>
  );
}
