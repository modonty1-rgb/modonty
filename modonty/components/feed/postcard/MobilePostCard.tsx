import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { ModontyAudioMark } from "@/components/icons/modonty-audio-mark";
import { ModontyCalendarMark } from "@/components/icons/modonty-calendar-mark";
import { ModontyArticlesMark } from "@/components/icons/modonty-articles-mark";
import { ModontyArrowMark } from "@/components/icons/modonty-arrow-mark";
import { cn } from "@/lib/utils";

import { SavePostButton } from "./SavePostButton";
import type { PostCardProps } from "./PostCard.types";

/**
 * Month + year, nothing finer. A feed date answers «هل هذا حديث؟», and the exact day is
 * noise at 11.5px. Built once at module scope — a formatter per card is a measurable cost
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
}

/**
 * Rebuilt 21 Aug 2026 (Khalid: «تشويش بصري كبير… الكرت محتاج مراجعة كاملة») on the
 * standard mobile feed-card anatomy (Google Discover · Medium · LinkedIn):
 *
 *   1. publisher line — tiny logo + full name, never clamped, quiet.
 *   2. the title is the ONLY loud element — up to 3 lines beside the thumb.
 *   3. thumb, `object-cover` — fills its frame, no letterboxed strip
 *      («الصورة مقطوعة من تحت»), no overlays eating it.
 *   4. one quiet meta row (audio mark) — nothing scattered around the card.
 *
 * The clamped one-line excerpt was CUT: chopped mid-sentence it repeated the title's
 * words and only added noise; the desktop card (in the DOM at every width) keeps the
 * full description for schema.org.
 *
 * 22 Aug 2026 — two of those decisions were deliberately overturned against a reference
 * card Khalid brought in, and the excerpt came back:
 *
 * - «صفر عناصر متناثرة حول الكرت» → a THIRD row was added: «اقرأ المزيد» · date · save.
 *   The rule held while the extras were floating counts. This row is not scattered — it
 *   is one aligned line at a fixed 32px, and it exists to carry the save control, which
 *   is how a passing reader becomes an account («عشان نحاول نحتفظ بالسبسكرايبر»).
 * - «العنوان ١٤px لا ١٥ — كان يقرأ كبيراً وثقيلاً» → 15px/700. What read heavy in August
 *   was 15px sitting on a card with no third row and a 16:9 thumb; against a 4:3 thumb
 *   and a quiet footer the title needs the extra step to stay the one loud element.
 *
 * «اقرأ المزيد» is deliberately NOT a link. The whole card is already one target via
 * `after:inset-0` on the title — a second anchor to the same URL duplicates the
 * destination for a screen reader and splits click tracking in two.
 */
function MobilePostCardContent({ post, hideClient }: MobilePostCardContentProps) {
  return (
    <div>
      {/* One header line: publisher at the start, the audio mark at its end (Khalid,
          21 Aug: «طلعها فوق جنب اسم الدكتور») — nothing floats alone in the card. */}
      {/* With the audio mark gone to the footer, the publisher name is the ONLY thing this
          row carries — so on a page that IS the publisher it has nothing left to show and
          disappears entirely, audio or not. */}
      <div className={cn("flex items-center gap-2", hideClient && "hidden")}>
        {!hideClient && (
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
        )}
      </div>

      <div className="mt-2 flex items-start gap-2.5">
        <div className="min-w-0 flex-1">
          <h3
            itemProp="headline"
            className="line-clamp-3 text-pretty text-[15px] font-bold leading-[1.4]"
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

        {/* Rectangular, filled with object-cover (Khalid, 21 Aug: «الصورة مستطيلة — خليها
            مستطيلة»). 4:3 at 124px instead of 16:9 at 112px: the reference card's shape,
            and it stands 93px tall — close enough to the three-line title beside it that
            the row reads as one block rather than a thumb floating next to text. */}
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

      {/* No divider above this row: the card already has a border, and a second line
          inside it draws the same boundary twice. 32px so the save control clears the
          WCAG 2.2 SC 2.5.8 minimum («at least 24 by 24 CSS pixels») without the row
          costing the 44px an article-page action bar spends.

          ICON SIZES, fixed 22 Aug (Khalid: «the icons size not follow best practice»).
          The row carried three different sizes — 14, 16, 16 — and every one of them was
          too small to hold its stroke: our marks are drawn on a 120 box with a stroke of
          10, which lands at 1.33px when the mark renders at 16. Under one device pixel on
          a 1x screen, so they came out washed rather than drawn.

          The rule now: every mark in this row is 20px — one size, stroke lands at 1.67px.
          Material 3 puts a 24px icon inside a ≥48px target; 20 inside 32 is that ratio.

          And every mark here is OURS (Khalid, 22 Aug: «ومال لوسيد، احنا بنشتغل على
          الاستاندر»). The arrow and the empty-state page were the last two lucide icons on
          this card; they are now `modonty-arrow-mark` and `modonty-articles-mark`, so the
          whole card is drawn by one hand. */}
      <div className="mt-2 flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-8 items-center gap-1 text-[13px] font-bold text-link-accent"
        >
          اقرأ المزيد
          {/* The words carry the call; the arrow only points. Body muted, diamond accent —
              the same split the audio badge uses, and the house rule for every mark on a
              reader's surface (DESIGN-SYSTEM «أحجام الأيقونات» §القواعد الثابتة). */}
          <ModontyArrowMark className="size-5 text-muted-foreground" />
        </span>
        <span className="flex-1" />
        {/* The audio mark moved down here on 22 Aug (Khalid: «move to bottom as icon»),
            and lost its «نسخة صوتية» label. It sat on the header line as a labelled badge,
            which on `/modonty` — where the publisher name is hidden — was the ONLY thing
            on that line, so a whole row existed for one badge. As a bare mark among the
            other footer controls it costs nothing and still says the same thing; the
            words live on for screen readers.

            Muted, not teal (Khalid, 22 Aug): the badge is a footnote — «this one also has
            audio» — so the SPEAKER stays quiet and only its diamond carries the brand
            colour, which the mark hard-codes to the accent whatever this class says. One
            spark instead of a whole teal glyph competing with «اقرأ المزيد». */}
        {post.hasAudio && (
          <span className="flex h-8 items-center text-muted-foreground" title="نسخة صوتية">
            <ModontyAudioMark className="size-5" aria-hidden />
            <span className="sr-only">نسخة صوتية</span>
          </span>
        )}
        <time
          itemProp="datePublished"
          dateTime={post.publishedAt.toISOString()}
          className="flex h-8 items-center gap-1 text-[11.5px] text-muted-foreground"
        >
          <ModontyCalendarMark className="size-5" aria-hidden />
          {CARD_DATE.format(post.publishedAt)}
        </time>
        <SavePostButton articleId={post.id} articleSlug={post.slug} />
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
      // 150 → 175 on 22 Aug: the footer row and the taller 4:3 thumb grew the real card.
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm lg:hidden [content-visibility:auto] [contain-intrinsic-size:auto_175px]",
        featured && "border-primary/20 shadow-primary/5",
        className,
      )}
    >
      <div data-nosnippet className="p-2.5">
        <MobilePostCardContent post={post} hideClient={hideClient} />
      </div>
    </article>
  );
}
