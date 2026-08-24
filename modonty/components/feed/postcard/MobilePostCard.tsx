import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { ModontyAudioMark } from "@/components/icons/modonty-audio-mark";
import { ModontyCalendarMark } from "@/components/icons/modonty-calendar-mark";
import { ModontyArticlesMark } from "@/components/icons/modonty-articles-mark";
import { cn } from "@/lib/utils";

import { SavePostButton } from "./SavePostButton";
import type { PostCardProps } from "./PostCard.types";

/**
 * Month + year, nothing finer. A feed date answers «هل هذا حديث؟», and the exact day is
 * noise at 12px. Built once at module scope — a formatter per card is a measurable cost
 * on a twenty-card feed. Fixed time zone so the string never depends on where the server
 * happens to run.
 */
const CARD_DATE = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  month: "long",
  year: "numeric",
  timeZone: "Asia/Riyadh",
});

interface MobilePostCardContentProps {
  post: PostCardProps["post"];
  /** On a page that IS the publisher (`/modonty`, a client page), the name repeats on
      every card with zero information — the caller hides the whole publisher line. */
  hideClient?: boolean;
  /** The feed's one cover-on-top card. See `PostCardProps.mobileHero`. */
  hero?: boolean;
}

/**
 * Rebuilt 21 Aug 2026 (Khalid: «تشويش بصري كبير… الكرت محتاج مراجعة كاملة») on the
 * standard mobile feed-card anatomy (Google Discover · Medium · LinkedIn):
 *
 *   1. publisher line — tiny logo + full name, never clamped, quiet.
 *   2. the title is the ONLY loud element — up to 3 lines beside the thumb.
 *   3. thumb, `object-cover` — fills its frame, no letterboxed strip
 *      («الصورة مقطوعة من تحت»), no overlays eating it.
 *   4. one quiet meta row — nothing scattered around the card.
 *
 * 22 Aug 2026 — a third row was added for the save control (how a passing reader becomes
 * an account), and the title went 14 → 15px.
 *
 * 23 Aug 2026 — the HYBRID (Khalid approved the mockup `documents/design/feed-card-hybrid-
 * mockup.html` after studying «8 best practices for UI card design»):
 *
 * - ONE «واجهة» card at the top of the homepage feed (`hero`): cover image 16:9 on top,
 *   18px two-line title, 14px excerpt, «الأحدث» tag. A visual anchor that costs one
 *   screen, not every screen — every card as a hero would halve cards-per-screen (3.7 →
 *   2.1) and multiply image bytes ×4–5 on a feed whose job is scanning.
 * - Compact cards keep the list anatomy but the title goes 15 → 16px and the excerpt
 *   12 → 13px, nearer the article's type floor without losing density.
 * - «اقرأ المزيد» is GONE: the whole card is already the link, and a word that looks like a
 *   button but is not one (not even for a screen reader) was the seventh element on a card
 *   that reads better with five.
 */
function MobilePostCardContent({ post, hideClient, hero }: MobilePostCardContentProps) {
  const publisher = !hideClient && (
    <p
      itemProp="publisher"
      itemScope
      itemType="https://schema.org/Organization"
      className="flex min-w-0 flex-1 items-center gap-1.5 text-xs font-medium leading-4 text-muted-foreground"
    >
      {post.clientLogo && (
        <span className="relative size-5 shrink-0 overflow-hidden rounded-full bg-muted" aria-hidden>
          <OptimizedImage
            media={asMedia(post.clientLogo, post.clientName)}
            alt=""
            fill
            sizes="20px"
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
  );

  const titleLink = (
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
  );

  /* One quiet row, 32px: audio mark · date at the start, save at the end. No divider
     above it — the card already has a border. ICON SIZES: every mark is 20px (fixed
     22 Aug — our marks are drawn on a 120 box with a 10 stroke; at 16px the stroke fell
     under one device pixel). Material 3 puts a 24px icon inside a ≥48px target; 20 in 32
     is that ratio, and the save control extends its tap box to 44 invisibly. */
  const footer = (
    <div className="mt-2 flex items-center gap-3">
      {post.hasAudio && (
        <span className="flex h-8 items-center text-muted-foreground" title="نسخة صوتية">
          <ModontyAudioMark className="size-5" aria-hidden />
          <span className="sr-only">نسخة صوتية</span>
        </span>
      )}
      <time
        itemProp="datePublished"
        dateTime={post.publishedAt.toISOString()}
        className="flex h-8 items-center gap-1 text-xs text-muted-foreground"
      >
        <ModontyCalendarMark className="size-5" aria-hidden />
        {CARD_DATE.format(post.publishedAt)}
      </time>
      <span className="flex-1" />
      <SavePostButton articleId={post.id} articleSlug={post.slug} />
    </div>
  );

  if (hero) {
    return (
      <div>
        {/* Cover first: 16:9 at the card's full width. It is the LCP candidate on the
            phone, so it loads eagerly with high priority — the only feed image that does. */}
        <div className="relative -mx-2.5 -mt-2.5 mb-2.5 aspect-video overflow-hidden bg-muted">
          {post.image ? (
            <OptimizedImage
              media={asMedia(post.image, post.title, post.imageBlur)}
              alt={post.title || "صورة المقال"}
              fill
              sizes="(min-width: 1024px) 0px, 100vw"
              className="object-cover"
              loading="eager"
              fetchPriority="high"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center">
              <ModontyArticlesMark className="size-10 text-muted-foreground/40" aria-hidden />
            </span>
          )}
          <span className="absolute start-2.5 top-2.5 rounded-full bg-black/55 px-2 py-1 text-[11px] font-bold text-white backdrop-blur">
            الأحدث
          </span>
        </div>
        {/* Headline first, byline second — same reorder as the desktop card. The partner
            answers "can I trust this?", which the reader only asks after the headline has
            interested them; putting it above meant the deciding line arrived third. */}
        <h3 itemProp="headline" className="line-clamp-2 text-pretty text-lg font-bold leading-[1.35]">
          {titleLink}
        </h3>
        {publisher && <div className="mt-1.5 flex items-center gap-2">{publisher}</div>}
        {post.excerpt && (
          <p itemProp="description" className="mt-1 line-clamp-2 text-sm leading-[1.55] text-muted-foreground">
            {post.excerpt}
          </p>
        )}
        {footer}
      </div>
    );
  }

  return (
    <div>
      {publisher && <div className="flex items-center gap-2">{publisher}</div>}

      <div className={cn("flex items-start gap-2.5", !hideClient && "mt-2")}>
        <div className="min-w-0 flex-1">
          <h3 itemProp="headline" className="line-clamp-3 text-pretty text-base font-bold leading-[1.4]">
            {titleLink}
          </h3>
          {/* The brief, two lines (Khalid, 21 Aug: «clamp the 2 line for the brief»). 13px,
              not 12 — body copy below Material's 14px floor read as a caption. */}
          {post.excerpt && (
            <p itemProp="description" className="mt-1 line-clamp-2 text-[13px] leading-[1.5] text-muted-foreground">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Rectangular, filled with object-cover (Khalid, 21 Aug: «الصورة مستطيلة — خليها
            مستطيلة»). 4:3 at 124px: the reference card's shape, and it stands 93px tall —
            close to the three-line title beside it, so the row reads as one block. */}
        <div className="relative aspect-[4/3] w-[124px] shrink-0 overflow-hidden rounded-lg bg-muted">
          {post.image ? (
            <OptimizedImage
              media={asMedia(post.image, post.title, post.imageBlur)}
              alt={post.title || "صورة المقال"}
              fill
              sizes="124px"
              className="object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center">
              <ModontyArticlesMark className="size-8 text-muted-foreground/40" aria-hidden />
            </span>
          )}
        </div>
      </div>

      {footer}
    </div>
  );
}

export function MobilePostCard({ className, featured, post, hideClient, mobileHero }: PostCardProps) {
  return (
    <article
      itemScope
      itemType="https://schema.org/Article"
      // `contain-intrinsic-size` must match what this card IS: it inherited 420px from the
      // old tall card, so off-screen rows inflated `/articles` to 6,659px instead of ~3,000
      // and the scrollbar lied (measured 21 Aug — on-screen cards 131-153px, off-screen 421).
      // 150 → 175 on 22 Aug: the footer row and the taller 4:3 thumb grew the real card.
      // The hero is always on screen (first card), so its estimate never matters.
      // Press feedback on the card itself: the whole card is one target (the title's
      // `after:inset-0`), and a target must answer on touch-DOWN, not on navigation.
      // `:active` reaches ancestors, so a tap anywhere on the stretched link presses the
      // card. Scale, not colour — 1% is felt, never seen as a layout move.
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm lg:hidden [content-visibility:auto] [contain-intrinsic-size:auto_175px]",
        "motion-safe:transition-transform motion-safe:duration-100 motion-safe:active:scale-[0.99]",
        featured && "border-primary/20 shadow-primary/5",
        // Modonty publishes here too, and its card was byte-identical to a partner's —
        // measured 24 Aug: same bg `rgb(31,31,35)`, same border, same radius — so a reader
        // parsed «مدونتي» as one more listed company. A tinted surface says «this one is the
        // platform» before any word is read (Khalid picked option B from the mockup).
        // Surface only: the anatomy, the height and the type scale are untouched.
        post.isCore && "border-primary/40 bg-gradient-to-b from-primary/[0.10] to-primary/[0.03]",
        className,
      )}
    >
      <div data-nosnippet className="p-2.5">
        <MobilePostCardContent post={post} hideClient={hideClient} hero={mobileHero} />
      </div>
    </article>
  );
}
