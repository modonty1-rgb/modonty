import type { InfiniteListPage } from "@modonty/shared/components/infinite-list";
import type { FeedPost } from "@/lib/types";

// Reads go through the GET endpoint, not a Server Action. Next.js dispatches
// Server Actions one at a time per client (server-actions.mdx), so a scroll fetch
// through an action would queue behind — and block — every other action on the page.
// Same endpoint the mobile app will call; publishedAt arrives as an ISO string.
export async function fetchMoreArticles(page: number): Promise<InfiniteListPage<FeedPost>> {
  const response = await fetch(`/api/articles?page=${page}`);
  if (!response.ok) throw new Error(`articles endpoint returned ${response.status}`);

  const result = (await response.json()) as { articles: FeedPost[]; hasMore: boolean };
  return {
    hasMore: result.hasMore,
    items: result.articles.map((article) => ({
      ...article,
      publishedAt: new Date(article.publishedAt),
    })),
  };
}
