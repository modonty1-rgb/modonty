import { FEED_VIEWS, type FeedView } from "../components/articles-feed/feed-views";
import { buildHref } from "./build-href";

// Switching the filter always returns to page 1 — page 3 of «الأحدث» is not page 3 of
// «الأكثر قراءة», and landing on an empty page after a filter change reads as a bug.
export function buildViewHrefs(): Record<FeedView, string> {
  return Object.fromEntries(FEED_VIEWS.map((option) => [option, buildHref(1, option)])) as Record<FeedView, string>;
}
