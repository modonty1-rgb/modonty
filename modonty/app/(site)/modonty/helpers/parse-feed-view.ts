import { FEED_VIEWS, type FeedView } from "../components/articles-feed/feed-views";

/** `?view=` as one of the feed's views; anything else is «الأحدث». */
export function parseFeedView(viewParam: string | undefined): FeedView {
  return FEED_VIEWS.includes(viewParam as FeedView) ? (viewParam as FeedView) : "latest";
}
