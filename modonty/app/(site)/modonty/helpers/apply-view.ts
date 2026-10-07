import type { FeedPost } from "@/lib/types";

import type { FeedView } from "../components/articles-feed/feed-views";

/**
 * Sorting and filtering happen on the array the page already fetched, not in a second
 * query. `getModontyArticles` returns modonty's whole published set in one read — a
 * few dozen rows — so a per-view query would be a second round trip to reorder data
 * already in memory. Revisit if modonty's own output ever outgrows one page of results.
 */
export function applyView(articles: FeedPost[], view: FeedView): FeedPost[] {
  if (view === "audio") return articles.filter((article) => article.hasAudio);
  if (view === "popular") return [...articles].sort((a, b) => b.views - a.views);
  return articles;
}
