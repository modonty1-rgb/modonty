import type { InfiniteListPage } from "@modonty/shared/components/infinite-list";

import type { FeedPost } from "@/lib/types";

import type { FeedView } from "../components/articles-feed/feed-views";

/** One chunk of modonty's own feed from `/api/articles`, sorted and filtered the way the page was. */
export async function fetchModontyArticlesPage(page: number, clientSlug: string, view: FeedView): Promise<InfiniteListPage<FeedPost>> {
  const response = await fetch(`/api/articles?page=${page}&client=${encodeURIComponent(clientSlug)}${view === "latest" ? "" : `&view=${view}`}`);
  if (!response.ok) throw new Error(`articles endpoint returned ${response.status}`);

  const result = (await response.json()) as { articles: FeedPost[]; hasMore: boolean };
  return {
    hasMore: result.hasMore,
    // JSON carries no Date — the card formats it, so it has to arrive as one.
    items: result.articles.map((item) => ({ ...item, publishedAt: new Date(item.publishedAt) })),
  };
}
