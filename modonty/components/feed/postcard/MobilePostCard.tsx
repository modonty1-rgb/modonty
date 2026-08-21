import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { IconArticle, IconVolume2 } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { PostCardProps } from "./PostCard.types";

interface MobilePostCardContentProps {
  post: PostCardProps["post"];
  /** On a page that IS the publisher (`/modonty`, a client page), the name repeats on
      every card with zero information — the caller hides the whole publisher line. */
  hideClient?: boolean;
}

/**
 * Rebuilt 21 Aug 2026 (Khalid: «تشويش بصري كبير… الكرت محتاج مراجعة كاملة») on the
 * standard mobile feed-card anatomy (Google Discover · Medium · LinkedIn):
 *
 *   1. publisher line — tiny logo + full name, never clamped, quiet.
 *   2. the title is the ONLY loud element — up to 3 lines beside the thumb.
 *   3. square thumb, `object-cover` — fills its frame, no letterboxed 5:2 strip
 *      («الصورة مقطوعة من تحت»), no overlays eating it.
 *   4. one quiet meta row (audio mark) — nothing scattered around the card.
 *
 * The clamped one-line excerpt was CUT: chopped mid-sentence it repeated the title's
 * words and only added noise; the desktop card (in the DOM at every width) keeps the
 * full description for schema.org.
 */
function MobilePostCardContent({ post, hideClient }: MobilePostCardContentProps) {
  return (
    <div>
      {/* One header line: publisher at the start, the audio mark at its end (Khalid,
          21 Aug: «طلعها فوق جنب اسم الدكتور») — nothing floats alone in the card. */}
      <div className={cn("flex items-center gap-2", hideClient && !post.hasAudio && "hidden")}>
        {!hideClient && (
        <p
          itemProp="publisher"
          itemScope
          itemType="https://schema.org/Organization"
          className="flex min-w-0 flex-1 items-center gap-1.5 text-xs font-medium leading-4 text-muted-foreground"
        >
          {post.clientLogo && (
            <span className="relative size-4 shrink-0 overflow-hidden rounded-full bg-muted" aria-hidden>
              <OptimizedImage
                media={asMedia(post.clientLogo, post.clientName)}
                alt=""
                fill
                sizes="16px"
                className="object-cover"
                loading="lazy"
                decoding="async"
              />
            </span>
          )}
          {/* `dir="auto"` isolates Latin names («Pain Core Clinic - د…») so they read
              left-to-right inside the RTL line instead of scrambling around the dash. */}
          <span itemProp="name" dir="auto" className="min-w-0">
            {post.clientName}
          </span>
        </p>
        )}
        {post.hasAudio && (
          <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-link-accent">
            <IconVolume2 className="size-3.5" aria-hidden />
            نسخة صوتية
          </span>
        )}
      </div>

      <div className="mt-2 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {/* 14px medium, not 15px semibold — the title was reading big and heavy on a
              phone (Khalid, 21 Aug); the weight step is enough hierarchy over the 12px
              excerpt below. */}
          <h3
            itemProp="headline"
            className="line-clamp-3 text-pretty text-sm font-medium leading-[1.5]"
          >
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
          {/* The brief, two lines (Khalid, 21 Aug: «clamp the 2 line for the brief»). */}
          {post.excerpt && (
            <p
              itemProp="description"
              className="mt-1 line-clamp-2 text-xs leading-[1.5] text-muted-foreground"
            >
              {post.excerpt}
            </p>
          )}
        </div>

        {/* 16:9, same shape as the source covers (Khalid, 21 Aug: «الصورة مستطيلة —
            خليها مستطيلة»), filled with object-cover. No border/strip/badge on it. */}
        <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
          {post.image ? (
            <OptimizedImage
              media={asMedia(post.image, post.title, post.imageBlur)}
              alt={post.title || "صورة المقال"}
              fill
              sizes="112px"
              className="object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center">
              <IconArticle className="size-7 text-muted-foreground/40" aria-hidden />
            </span>
          )}
        </div>
      </div>

    </div>
  );
}

export function MobilePostCard({ className, featured, post, hideClient }: PostCardProps) {
  return (
    <article
      itemScope
      itemType="https://schema.org/Article"
      // `contain-intrinsic-size` must match what this card IS: it inherited 420px from the
      // old tall card, so off-screen rows inflated `/articles` to 6,659px instead of ~3,000
      // and the scrollbar lied (measured 21 Aug — on-screen cards 131-153px, off-screen 421).
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm lg:hidden [content-visibility:auto] [contain-intrinsic-size:auto_150px]",
        featured && "border-primary/20 shadow-primary/5",
        className,
      )}
    >
      <div data-nosnippet className="p-3">
        <MobilePostCardContent post={post} hideClient={hideClient} />
      </div>
    </article>
  );
}
