import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { IconLike, IconSaved, IconComment, IconViews, IconShare } from "@/lib/icons";
import type { PostCardProps } from "./PostCard.types";

export function PostCardFooter({ post }: PostCardProps) {
  const articleUrl = `/articles/${post.slug}`;

  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
      <CtaTrackedLink
        href={articleUrl}
        label="Feed card – عرض المقال"
        type="LINK"
        articleId={post.id}
        clientId={post.clientId}
        className="flex items-center gap-2 hover:text-foreground transition-colors"
        aria-label="عرض المقال"
      >
        <span className="inline-flex items-center gap-1">
          <IconLike className="h-4 w-4" />
          {post.likes}
        </span>
        <span className="hidden" aria-hidden>
          {post.dislikes}
        </span>
        <span className="inline-flex items-center gap-1">
          <IconSaved className="h-4 w-4" />
          {post.favorites}
        </span>
        <span className="inline-flex items-center gap-1">
          <IconComment className="h-4 w-4" />
          {post.comments}
        </span>
        <span className="inline-flex items-center gap-1">
          <IconViews className="h-4 w-4" />
          {post.views}
        </span>
      </CtaTrackedLink>
      <CtaTrackedLink
        href={articleUrl}
        label="Feed card – مشاركة"
        type="LINK"
        articleId={post.id}
        clientId={post.clientId}
        aria-label="مشاركة المقال"
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 hover:text-primary"
      >
        <IconShare className="h-4 w-4" />
        <span className="hidden sm:inline">مشاركة</span>
      </CtaTrackedLink>
    </div>
  );
}

