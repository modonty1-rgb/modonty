import Link from "@/components/link";
import { Share2, ThumbsUp, ThumbsDown, Heart, MessageCircle, Eye } from "lucide-react";
import type { PostCardProps } from "./PostCard.types";

export function PostCardFooter({ post }: PostCardProps) {
  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
      <Link
        href={`/articles/${post.slug}`}
        className="flex items-center gap-2 hover:text-foreground transition-colors"
        aria-label="عرض المقال"
      >
        <span className="inline-flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" />
          {post.likes}
        </span>
        <span className="inline-flex items-center gap-1">
          <ThumbsDown className="h-3 w-3" />
          {post.dislikes}
        </span>
        <span className="inline-flex items-center gap-1">
          <Heart className="h-3 w-3" />
          {post.favorites}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          {post.comments}
        </span>
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {post.views}
        </span>
      </Link>
      <Link
        href={`/articles/${post.slug}`}
        aria-label="مشاركة المقال"
        className="inline-flex items-center gap-1 hover:text-primary"
      >
        <Share2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">مشاركة</span>
      </Link>
    </div>
  );
}

