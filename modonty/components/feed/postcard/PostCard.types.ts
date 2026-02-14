import type { FeedPost } from "@/lib/types";

export interface PostCardProps {
  post: FeedPost;
  priority?: boolean;
  isLcp?: boolean;
  className?: string;
  index?: number;
  /** When true, hide client name and avatar (e.g. on a client page where context is already the client). */
  hideClient?: boolean;
}

