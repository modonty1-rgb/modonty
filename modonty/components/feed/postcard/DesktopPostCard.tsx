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
        // The first card is the eye's entry point, so it is allowed to be louder than the rest:
        // a real ring instead of a hairline, and a lift the others only get on hover. Kept to
        // border and shadow — the anatomy, the widths and the image ratio stay identical, so
        // the feed still reads as one list and not as two designs.
        featured ? "border-primary/40 ring-1 ring-primary/25 shadow-md shadow-primary/10" : "border-border",
        // Same signal as the phone card: modonty's own article carries a tinted surface so it
        // reads as the platform, not as one more listed partner. Surface only — the card's
        // anatomy and size are untouched. See `MobilePostCard` for the measurement.
        rest.post.isCore && "!border-primary/40 bg-gradient-to-b from-primary/[0.10] to-primary/[0.03]",
        className
      )}
    >
      <PostCardHeroImage post={rest.post} isLcp={effectiveIsLcp} index={index} articleTitle={rest.post.title} featured={featured} />
      {/* Title BEFORE the partner line, not after it (measured 24 Aug: the card read
          image → partner → reading time → title, so the one thing that decides the click
          arrived fourth). The partner and the timestamp answer "should I trust this?" —
          a question the reader only asks once the headline has interested them. Order is
          the whole change: no component was rewritten, the byline still carries the same
          itemProp markup for schema.org. */}
      <div data-nosnippet className="space-y-3 p-4">
        <PostCardBody post={rest.post} isLcp={effectiveIsLcp} index={index} highlightQuery={rest.highlightQuery} featured={featured} />
        <PostCardHeader post={rest.post} index={index} hideClient={hideClient} />
        <PostCardFooter post={rest.post} />
      </div>
    </article>
  );
}
