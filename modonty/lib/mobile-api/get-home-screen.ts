import { cacheLife, cacheTag } from "next/cache";

import { getHomeFeedArticles } from "@/app/(site)/(homepage)/data/get-home-feed-articles";
import { getReelsFeedPage } from "@/lib/queries/get-reels-feed-page";
import { getIndustriesWithCounts } from "@/lib/queries/get-industries-with-counts";
import { getLatestPartners } from "@/lib/queries/get-latest-partners";
import { getCoreClientSlug } from "@/lib/settings/get-core-client-slug";
import { FEED_PAGE_SIZE } from "@/lib/queries/feed-constants";

/**
 * The app's first screen — the SAME reads the web homepage composes (`CachedHomePage.tsx`:
 * the feed's first chunk, reels, industries; `TrustCard` home variant: the 3 newest partners),
 * plus the core client's slug that «تابع مدونتي» follows. Cached under the homepage's own tags,
 * so an admin publish refreshes both doors at once. No session read — same bytes for everyone.
 */
export async function getHomeScreen() {
  "use cache";
  cacheLife("hours");
  cacheTag("homepage", "articles", "settings", "reels", "clients");

  const [articles, reels, industries, partners, coreClientSlug] = await Promise.all([
    getHomeFeedArticles(),
    getReelsFeedPage(),
    getIndustriesWithCounts(),
    getLatestPartners(3),
    getCoreClientSlug(),
  ]);

  return {
    articles,
    hasMore: articles.length >= FEED_PAGE_SIZE,
    reels: reels.items,
    industries,
    partners,
    coreClientSlug,
  };
}
