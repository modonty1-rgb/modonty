import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { IconArticle } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { PostCardHeroImage } from "./PostCardHeroImage";
import type { PostCardProps } from "./PostCard.types";

interface MobilePostCardContentProps {
  post: PostCardProps["post"];
}

function MobilePostCardContent({ post }: MobilePostCardContentProps) {
  const excerpt = post.excerpt ?? "";

  return (
    <div className="flex min-w-0 gap-2">
      <div className="min-w-0 flex-1">
        <h3 itemProp="headline" className="line-clamp-2 text-[clamp(0.8125rem,3.35vw,0.9375rem)] font-semibold leading-[clamp(1.125rem,4.6vw,1.375rem)]">
          <CtaTrackedLink
            href={`/articles/${post.slug}`}
            label="Feed card – عنوان المقال"
            type="LINK"
            articleId={post.id}
            clientId={post.clientId}
            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary focus-visible:after:ring-offset-2"
          >
            {post.title}
          </CtaTrackedLink>
        </h3>
        <p itemProp="description" className="mt-1 line-clamp-1 text-[clamp(0.75rem,3.2vw,0.8125rem)] leading-[clamp(1rem,4vw,1.125rem)] text-muted-foreground">{excerpt}</p>
      </div>
      <MobilePostCardImage post={post} />
    </div>
  );
}

function MobilePostCardImage({ post }: MobilePostCardContentProps) {
  return (
    <div className="w-[clamp(5.75rem,26vw,6.5rem)] shrink-0 overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      {post.image ? (
        <PostCardHeroImage post={post} enableHoverEffect={false} sizes="thumb" />
      ) : (
        <div className="relative aspect-video bg-muted">
          <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/80 to-muted/40">
            <IconArticle className="size-7 text-muted-foreground/50" aria-hidden />
          </span>
        </div>
      )}
      <div itemProp="publisher" itemScope itemType="https://schema.org/Organization" className="flex min-h-8 items-center border-t border-border/70 bg-gradient-to-b from-background to-muted/70 px-1.5 py-0.5">
        <span itemProp="name" className="w-full truncate text-center text-[clamp(0.625rem,2.8vw,0.6875rem)] font-bold leading-4 text-foreground">
          {post.clientName}
        </span>
      </div>
    </div>
  );
}

export function MobilePostCard({ className, featured, post }: PostCardProps) {
  return (
    <article
      itemScope
      itemType="https://schema.org/Article"
      className={cn("relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm lg:hidden [content-visibility:auto] [contain-intrinsic-size:auto_420px]", featured && "border-primary/20 shadow-primary/5", className)}
    >
      <div data-nosnippet className="p-3">
        <MobilePostCardContent post={post} />
      </div>
    </article>
  );
}
