import type { FeedView } from "../components/articles-feed/feed-views";

/** `/modonty` with only the parameters that differ from the default (`view=latest`, `page=1` are left out). */
export function buildHref(targetPage: number, targetView: FeedView): string {
  const params = new URLSearchParams();
  if (targetView !== "latest") params.set("view", targetView);
  if (targetPage > 1) params.set("page", String(targetPage));
  const query = params.toString();
  return query ? `/modonty?${query}` : "/modonty";
}
