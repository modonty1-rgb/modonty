import { cn } from "@/lib/utils";
import type { PostCardProps } from "./PostCard.types";
import { PostCardHeader } from "./PostCardHeader";
import { PostCardBody } from "./PostCardBody";
import { PostCardFooter } from "./PostCardFooter";
import { PostCardHeroImage } from "./PostCardHeroImage";

export function PostCard({ className, index, isLcp, hideClient, featured, ...rest }: PostCardProps) {
  const effectiveIsLcp = isLcp ?? (index === 0);

  return (
    <article
      itemScope
      itemType="https://schema.org/Article"
      className={cn(
        "relative group rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md",
        featured ? "border-primary/20 shadow-primary/5" : "border-border",
        className
      )}
    >
      <PostCardHeroImage
        post={rest.post}
        isLcp={effectiveIsLcp}
        index={index}
        articleTitle={rest.post.title}
        featured={featured}
      />
      <div className="p-4 space-y-3">
        <PostCardHeader post={rest.post} index={index} hideClient={hideClient} />
        <PostCardBody
          post={rest.post}
          isLcp={effectiveIsLcp}
          index={index}
          highlightQuery={rest.highlightQuery}
          featured={featured}
        />
        <PostCardFooter post={rest.post} />
      </div>
    </article>
  );
}
