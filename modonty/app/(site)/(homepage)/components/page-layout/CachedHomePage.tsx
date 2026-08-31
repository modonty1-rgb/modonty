import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { PageLayout } from "@/app/(site)/(homepage)/components/page-layout/PageLayout";
import { getHomeFeedArticles } from "@/app/(site)/(homepage)/data/get-home-feed-articles";
import { getMoreArticles } from "@/app/(site)/(homepage)/data/get-more-articles";
import { getReelsFeedPage } from "@/lib/queries/get-reels-feed-page";
import { getIndustriesWithCounts } from "@/lib/queries/get-industries-with-counts";
import { getArticlesArchive } from "@/lib/articles/archive/get-articles-archive";
import { countByReadingTime } from "@/lib/articles/archive/reading-time-buckets";
import { FEED_PAGE_SIZE } from "@/lib/queries/feed-constants";
import { getListingPageSeo } from "@/lib/seo/get-listing-page-seo";
import { messages } from "@/lib/i18n/messages";
import { jsonLdHtmlFromString } from "@/lib/seo";
import type { FeedPost } from "@/lib/types";

interface CachedHomePageProps {
  /** 1 = `/`; n ≥ 2 = `/page/n`. Part of the cache key, so every chunk is cached on its own. */
  page: number;
  /** Per-request slot created outside the cache (reads the session). Passed through, never read. */
  userCard: ReactNode;
}

async function getFeedChunk(page: number): Promise<{ articles: FeedPost[]; hasMore: boolean }> {
  if (page > 1) return getMoreArticles(page);
  const articles = await getHomeFeedArticles();
  return { articles, hasMore: articles.length >= FEED_PAGE_SIZE };
}

/**
 * The homepage, for every chunk of its paginated series. `/page/n` used to render a bare
 * archive (heading + cards), so a visitor who refreshed mid-scroll landed on a page that
 * looked nothing like the one they were reading. Google's rule for the series is that
 * each URL shows consistent content — the same page with the feed starting at chunk n
 * satisfies both the crawler and the reader.
 */
export async function CachedHomePage({ page, userCard }: CachedHomePageProps) {
  "use cache";
  cacheLife("minutes");
  cacheTag("homepage", "articles", "settings");

  // `wholeArchive` feeds ONLY the phone's reading-time tiles (counts per bucket). Same cached
  // call `/articles` makes, inside the same Promise.all — one more parallel read inside this
  // page's own cache, no waterfall, nothing extra on the client.
  const [{ jsonLd }, feed, industries, reels, wholeArchive] = await Promise.all([
    getListingPageSeo("home"),
    getFeedChunk(page),
    getIndustriesWithCounts(),
    getReelsFeedPage(),
    getArticlesArchive({}),
  ]);
  const readingTimeCounts = countByReadingTime(wholeArchive);

  // Google: "make sure that page values adjust correctly … return a 404".
  if (page > 1 && feed.articles.length === 0) notFound();

  const reelItems = reels.items;

  return (
    <>
      {/* The listing schema describes the homepage itself; a chunk is not a second homepage. */}
      {page === 1 && jsonLd?.trim() && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtmlFromString(jsonLd) }}
        />
      )}
      {page === 1 && <h1 className="sr-only">{messages.modonty.homeHeading}</h1>}
      <PageLayout
        posts={feed.articles}
        hasMore={feed.hasMore}
        page={page}
        industries={industries}
        reels={reelItems}
        userCard={userCard}
        readingTimeCounts={readingTimeCounts}
      />
      {/* The mobile bottom bar (احجز · تسوّق · مودو) is HIDDEN on the homepage as of 23 Aug
          (Khalid: «no need to show الشريط السفلي, let make pure article»). CONFIRMED as the
          final answer on 24 Aug — «no door in the home page, it pure article»: the phone
          homepage deliberately offers no route to `/booking` or `/shop` at all (they live in
          the desktop rail only, `hidden lg:block`). Board card HOMEMOB closed that decision.
          Its files (`mobile-bottom-bar/BottomBar` · `ServiceBar`) were kept on disk for a day
          and then DELETED on 24 Aug (card DEADUI7) — eight days at zero importers. Modo's
          doorway moved into the feed (ArticlesList, after card 2). */}
    </>
  );
}
