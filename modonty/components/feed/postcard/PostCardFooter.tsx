import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { IconLike, IconSaved, IconComment, IconViews, IconShare } from "@/lib/icons";
import type { PostCardProps } from "./PostCard.types";

export function PostCardFooter({ post }: PostCardProps) {
  const articleUrl = `/articles/${post.slug}`;

  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
      {/* Stats — relative z-10 to sit above the stretched-link overlay */}
      <div className="relative z-10 flex items-center gap-2">
        <span className="inline-flex items-center gap-1">
          <IconLike className="h-4 w-4" />
          {post.likes}
        </span>
        <span className="inline-flex items-center gap-1">
          <IconComment className="h-4 w-4" />
          {post.comments}
        </span>
        <span className="inline-flex items-center gap-1">
          <IconViews className="h-4 w-4" />
          {post.views}
        </span>
        <span className="inline-flex items-center gap-1" aria-hidden>
          <IconSaved className="h-4 w-4" />
          {post.favorites}
        </span>
      </div>
      {/* Share — interactive, must be z-10 */}
      <CtaTrackedLink
        href={articleUrl}
        label="Feed card – مشاركة"
        type="LINK"
        articleId={post.id}
        clientId={post.clientId}
        aria-label="مشاركة المقال"
        className="relative z-10 inline-flex min-h-11 min-w-11 items-center justify-center gap-1 hover:text-primary"
      >
        <IconShare className="h-4 w-4" />
        <span className="hidden sm:inline">مشاركة</span>
      </CtaTrackedLink>
    </div>
  );
}
