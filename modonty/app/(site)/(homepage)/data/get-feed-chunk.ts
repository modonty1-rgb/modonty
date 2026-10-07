import { getHomeFeedArticles } from "./get-home-feed-articles";
import { getMoreArticles } from "./get-more-articles";
import { FEED_PAGE_SIZE } from "@/lib/queries/feed-constants";
import type { FeedPost } from "@/lib/types";

export async function getFeedChunk(page: number): Promise<{ articles: FeedPost[]; hasMore: boolean }> {
  if (page > 1) return getMoreArticles(page);
  const articles = await getHomeFeedArticles();
  return { articles, hasMore: articles.length >= FEED_PAGE_SIZE };
}
