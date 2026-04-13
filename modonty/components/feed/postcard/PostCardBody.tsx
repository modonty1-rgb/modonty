import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { highlightQuery } from "@/lib/highlight-query";
import { IconChevronLeft } from "@/lib/icons";
import type { PostCardProps } from "./PostCard.types";

export function PostCardBody({ post, highlightQuery: query }: PostCardProps) {
  const rawExcerpt = post.excerpt ?? post.content;
  const titleContent = query ? highlightQuery(post.title, query) : post.title;
  const excerptContent = query ? highlightQuery(rawExcerpt, query) : rawExcerpt;

  return (
    <>
      {post.title && (
        // Stretched-link: the after pseudo-element fills the relative <article> container,
        // making the entire card clickable while keeping other z-10 elements interactive.
        <h3
          itemProp="headline"
          className="font-semibold text-base line-clamp-2 min-h-[2.8rem] break-words hyphens-auto"
        >
          <CtaTrackedLink
            href={`/articles/${post.slug}`}
            label="Feed card – عنوان المقال"
            type="LINK"
            articleId={post.id}
            clientId={post.clientId}
            className="hover:text-primary transition-colors after:absolute after:inset-0 after:content-['']"
          >
            {titleContent}
          </CtaTrackedLink>
        </h3>
      )}
      <p
        itemProp="description"
        className="text-sm text-muted-foreground leading-relaxed line-clamp-2"
      >
        {excerptContent}
      </p>
      <div className="flex items-center justify-end">
        <span
          aria-hidden="true"
          className="relative z-10 inline-flex items-center gap-1 text-sm font-semibold text-primary pointer-events-none"
        >
          اقرأ المزيد
          <IconChevronLeft className="h-4 w-4" />
        </span>
      </div>
    </>
  );
}
