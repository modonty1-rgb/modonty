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
        // content-visibility skips rendering off-screen cards (Vercel rule
        // rendering-content-visibility); `auto 500px` reserves an estimated height
        // so the scrollbar doesn't jump, then remembers the real one.
        "relative group hidden overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md lg:block [content-visibility:auto] [contain-intrinsic-size:auto_500px]",
        featured ? "border-primary/20 shadow-primary/5" : "border-border",
        // Same signal as the phone card: modonty's own article carries a tinted surface so it
        // reads as the platform, not as one more listed partner. Surface only — the card's
        // anatomy and size are untouched. See `MobilePostCard` for the measurement.
        rest.post.isCore && "!border-primary/40 bg-gradient-to-b from-primary/[0.10] to-primary/[0.03]",
        className
      )}
    >
      <PostCardHeroImage post={rest.post} isLcp={effectiveIsLcp} index={index} articleTitle={rest.post.title} featured={featured} />
      <div data-nosnippet className="space-y-3 p-4">
        <PostCardHeader post={rest.post} index={index} hideClient={hideClient} />
        <PostCardBody post={rest.post} isLcp={effectiveIsLcp} index={index} highlightQuery={rest.highlightQuery} featured={featured} />
        <PostCardFooter post={rest.post} />
      </div>
    </article>
  );
}
