import Link from "@/components/link";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { highlightQuery } from "@/lib/highlight-query";
import type { PostCardProps } from "./PostCard.types";
import { PostCardHeroImage } from "./PostCardHeroImage";
import { IconChevronLeft } from "@/lib/icons";

export function PostCardBody({ post, isLcp, index, highlightQuery: query }: PostCardProps) {
  const titleContent = query ? highlightQuery(post.title, query) : post.title;
  const bodyContent = query ? highlightQuery(post.content, query) : post.content;

  return (
    <>
      {post.title && (
        <Link href={`/articles/${post.slug}`} className="block">
          <h3
            itemProp="headline"
            className="mb-1 font-semibold text-base hover:text-primary transition-colors line-clamp-2 min-h-[2.8rem]"
          >
            {titleContent}
          </h3>
        </Link>
      )}
      <p
        itemProp="description"
        className="text-sm text-foreground leading-relaxed whitespace-pre-line"
      >
        {bodyContent}
      </p>

      <PostCardHeroImage
        post={post}
        isLcp={isLcp}
        index={index}
        articleTitle={post.title}
      />
      <div className="flex items-center justify-end">
        <CtaTrackedLink
          href={`/articles/${post.slug}`}
          label="اقرأ المزيد"
          type="LINK"
          articleId={post.id}
          clientId={post.clientId}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          اقرأ المزيد
          <IconChevronLeft className="h-4 w-4" aria-hidden />
        </CtaTrackedLink>
      </div>
    </>
  );
}
