import type { FeedPost } from "@/lib/types";

export interface PostCardProps {
  post: FeedPost;
  priority?: boolean;
  isLcp?: boolean;
  className?: string;
  index?: number;
}

