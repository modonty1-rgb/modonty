import type { FeedPost } from "@/lib/types";

export interface PostCardProps {
  post: FeedPost;
  isLcp?: boolean;
  className?: string;
  index?: number;
  /** When true, hide client name and avatar (e.g. on a client page where context is already the client). */
  hideClient?: boolean;
  /** When set, highlights this query in title and content (e.g. search results). */
  highlightQuery?: string;
  /** Passed to hero image link for accessible name. */
  articleTitle?: string;
}

