import { ArticleHeroWarm } from "@/components/media/hero-warm";
import { cn } from "@/lib/utils";
import { PostCardBody } from "./PostCardBody";
import { PostCardFooter } from "./PostCardFooter";
import { PostCardHeader } from "./PostCardHeader";
import { PostCardHeroImage } from "./PostCardHeroImage";
import type { PostCardProps } from "./PostCard.types";

export function DesktopPostCard({ className, index, isLcp, hideClient, featured, ...rest }: PostCardProps) {
  const effectiveIsLcp = isLcp ?? (index === 0);

  return (
    <article
      itemScope
      itemType="https://schema.org/Article"
      className={cn(
        "relative group hidden overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md lg:block",
        featured ? "border-primary/20 shadow-primary/5" : "border-border",
        className
      )}
    >
      <ArticleHeroWarm href={`/articles/${rest.post.slug}`} imageUrl={rest.post.image ?? null} />
      <PostCardHeroImage post={rest.post} isLcp={effectiveIsLcp} index={index} articleTitle={rest.post.title} featured={featured} />
      <div data-nosnippet className="space-y-3 p-4">
        <PostCardHeader post={rest.post} index={index} hideClient={hideClient} />
        <PostCardBody post={rest.post} isLcp={effectiveIsLcp} index={index} highlightQuery={rest.highlightQuery} featured={featured} />
        <PostCardFooter post={rest.post} />
      </div>
    </article>
  );
}
