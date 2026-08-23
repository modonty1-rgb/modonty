/**
 * The feed's filter axes. Separate from both the feed and the menu because the server
 * component, the client menu and the page all need them — importing them from the feed
 * would drag the whole server component into the client bundle.
 */
export const FEED_VIEWS = ["latest", "popular", "audio"] as const;

export type FeedView = (typeof FEED_VIEWS)[number];

export const VIEW_LABEL: Record<FeedView, string> = {
  latest: "الأحدث",
  popular: "الأكثر قراءة",
  audio: "صوتية",
};
