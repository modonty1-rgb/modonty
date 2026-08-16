import { Suspense } from "react";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { PageLayout } from "@/app/(homepage)/components/page-layout/PageLayout";
import { BottomBar } from "@/app/(homepage)/components/mobile-bottom-bar/BottomBar";
import { getCorePublisherArticles } from "@/app/(homepage)/data/get-core-publisher-articles";
import { getHomeFeedArticles } from "@/app/(homepage)/data/get-home-feed-articles";
import { getMoreArticles } from "@/app/(homepage)/data/get-more-articles";
import { getReelsFeedPage } from "@/app/reels/helpers/reels-feed";
import { getIndustriesWithCounts } from "@/lib/queries/get-industries-with-counts";
import { FEED_PAGE_SIZE } from "@/lib/queries/feed-constants";
import { getBrandMedia } from "@/lib/settings/get-brand-media";
import { getListingPageSeo } from "@/lib/seo/get-listing-page-seo";
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

  const [{ jsonLd }, feed, corePublisherArticles, brandMedia, industries, reels] = await Promise.all([
    getListingPageSeo("home"),
    getFeedChunk(page),
    getCorePublisherArticles(),
    getBrandMedia(),
    getIndustriesWithCounts(),
    getReelsFeedPage(),
  ]);

  // Google: "make sure that page values adjust correctly … return a 404".
  if (page > 1 && feed.articles.length === 0) notFound();

  // TEMPORARY (2026-08-15, dev only): modonty_dev has no reels, and Khalid wants to see
  // the reels card's shape under the action strip. Three stand-ins so the card renders;
  // never reaches production, and gets removed once the placement is decided.
  const reelItems =
    process.env.NODE_ENV === "development" && reels.items.length === 0
      ? feed.articles.slice(0, 3).map((a) => ({ id: `preview-${a.id}`, title: a.title, imageUrl: a.image ?? null, clientName: a.clientName }))
      : reels.items;

  return (
    <>
      {/* The listing schema describes the homepage itself; a chunk is not a second homepage. */}
      {page === 1 && jsonLd?.trim() && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtmlFromString(jsonLd) }}
        />
      )}
      {page === 1 && <h1 className="sr-only">مدونتي — منصة المحتوى العربي</h1>}
      <PageLayout
        posts={feed.articles}
        hasMore={feed.hasMore}
        page={page}
        corePublisherArticles={corePublisherArticles}
        brandLogoUrl={brandMedia.logoUrl}
        industries={industries}
        reels={reelItems}
        userCard={userCard}
      />
      {/* Mobile-only action bar (filters + newsletter) — homepage only, lazy client shell */}
      <Suspense fallback={null}>
        <BottomBar />
      </Suspense>
    </>
  );
}
