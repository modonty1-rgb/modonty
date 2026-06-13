import Image from "next/image";
import Link from "@/components/link";
import { Card } from "@/components/ui/card";
import { BRAND_AVATAR_RADIUS } from "@/lib/brand-avatar";
import { IconClients } from "@/lib/icons";
import type { ClientHeroSlide } from "@/app/api/helpers/client-queries";

// Pure-CSS slideshow — Server Component, zero client JS.
//
// No-dip / no-gap crossfade: a plain opacity crossfade (one slide 1→0 while the
// next 0→1) momentarily lets the background show through (both layers partial),
// which reads as an "empty/washed" box — worst at the loop seam. Instead we layer
// with 3 z-levels: the OUTGOING slide stays fully opaque underneath until the
// INCOMING one (on top) has completely covered it, THEN it drops while hidden.
// So a fully-opaque slide is ALWAYS on screen — including last→first.
//
// Visual polish (all CSS, zero runtime cost): cinematic Ken-Burns breathe ·
// per-slide progress bar · richer identity overlay. The hero fills the card
// (object-cover — same treatment as the article client card), and a partner logo
// badge guarantees brand identity even when the banner is cropped to fill.
const PER_SLIDE = 4.5; // seconds each slide stays in focus

export function HeroSlider({ slides }: { slides: ClientHeroSlide[] }) {
  if (slides.length === 0) return null;

  const n = slides.length;
  const T = n * PER_SLIDE; // full cycle, seconds
  const dur = T.toFixed(1);
  const p = (v: number) => v.toFixed(3);

  // Ken-Burns: gentle SYMMETRIC breathe (1.03↔1.09) so the loop seam never snaps;
  // phase is irrelevant (only the visible slide is seen) → no per-slide delay.
  const ken =
    `@keyframes modontyHeroKen{0%,100%{transform:scale(1.03)}50%{transform:scale(1.09)}}` +
    `.modonty-hero-ken{animation:modontyHeroKen ${(PER_SLIDE * 2).toFixed(1)}s ease-in-out infinite}`;

  if (n === 1) {
    // Single partner — no rotation; just the breathe (still pausable + RM-aware).
    const css =
      ken +
      `.modonty-hero-slides:hover .modonty-hero-ken,.modonty-hero-slides:focus-within .modonty-hero-ken{animation-play-state:paused}` +
      `@media (prefers-reduced-motion:reduce){.modonty-hero-ken{animation:none;transform:scale(1)}}`;
    return <SliderShell slides={slides} n={n} css={css} />;
  }

  const slice = 100 / n; // each slide's share of the cycle (%)
  const fadeIn = Math.min(6, slice * 0.4); // fade-in window (% of cycle)
  const fadeInSec = (fadeIn / 100) * T; // same, in seconds
  const a = slice; // end of the slide's "on-top" slot
  const b = slice + fadeIn; // end of the "covered, still opaque" tail
  const shift = (i: number) => (i * PER_SLIDE - fadeInSec).toFixed(3); // negative for slide 0 → visible on load

  const css =
    // base (shown during a slide's initial positive delay): hidden + bottom layer
    `.modonty-hero-slide{opacity:0;z-index:1;pointer-events:none}` +
    `.modonty-hero-slide:first-child{opacity:1;z-index:3;pointer-events:auto}` +
    ken +
    // OPACITY: fade in, hold through own slot AND the next slide's fade-in, then drop
    // (instant) — but it's fully covered by the incoming slide at that point.
    `@keyframes modontyHeroFade{0%{opacity:0}${p(fadeIn)}%{opacity:1}${p(b)}%{opacity:1}${p(b + 0.01)}%{opacity:0}100%{opacity:0}}` +
    // LAYER: z3 = entering/current (top) · z2 = previous, being covered · z1 = idle.
    // pointer-events only while it's the top/current slide.
    `@keyframes modontyHeroLayer{0%{z-index:3;pointer-events:auto}${p(a)}%{z-index:3;pointer-events:auto}${p(a + 0.01)}%{z-index:2;pointer-events:none}${p(b)}%{z-index:2;pointer-events:none}${p(b + 0.01)}%{z-index:1;pointer-events:none}100%{z-index:1;pointer-events:none}}` +
    // DOT: bright + wide during its slide's slot.
    `@keyframes modontyHeroDot{0%{opacity:1;transform:scaleX(2.4)}${p(a)}%{opacity:1;transform:scaleX(2.4)}${p(a + 0.01)}%{opacity:.35;transform:scaleX(1)}100%{opacity:.35;transform:scaleX(1)}}` +
    // PROGRESS: fills once per slide (loops every PER_SLIDE → lock-step with changes).
    `@keyframes modontyHeroProgress{from{transform:scaleX(0)}to{transform:scaleX(1)}}` +
    // forwards: during the initial positive delay each slide keeps its static (hidden)
    // state instead of the 0% keyframe; slide 0's negative delay makes it visible at load.
    `.modonty-hero-slide{animation:modontyHeroFade ${dur}s ease-in-out infinite forwards,modontyHeroLayer ${dur}s infinite forwards}` +
    `.modonty-hero-dot{animation:modontyHeroDot ${dur}s infinite both}` +
    `.modonty-hero-progress{animation:modontyHeroProgress ${PER_SLIDE}s linear infinite;animation-delay:-${fadeInSec.toFixed(3)}s}` +
    `.modonty-hero-slides:hover .modonty-hero-slide,.modonty-hero-slides:hover .modonty-hero-dot,.modonty-hero-slides:hover .modonty-hero-ken,.modonty-hero-slides:hover .modonty-hero-progress,.modonty-hero-slides:focus-within .modonty-hero-slide,.modonty-hero-slides:focus-within .modonty-hero-dot,.modonty-hero-slides:focus-within .modonty-hero-ken,.modonty-hero-slides:focus-within .modonty-hero-progress{animation-play-state:paused}` +
    slides
      .map((_, i) => {
        const d = shift(i);
        return `.modonty-hero-slide:nth-child(${i + 1}){animation-delay:${d}s}.modonty-hero-dot:nth-child(${i + 1}){animation-delay:${d}s}`;
      })
      .join("") +
    // Reduced-motion: slow the whole rotation right down (every partner stays
    // reachable) and drop the breathe + progress bar.
    `@media (prefers-reduced-motion:reduce){.modonty-hero-slide,.modonty-hero-dot{animation-duration:${(T * 2).toFixed(1)}s}.modonty-hero-ken{animation:none;transform:scale(1)}.modonty-hero-progress{animation:none;opacity:0}}`;

  return <SliderShell slides={slides} n={n} css={css} />;
}

function SliderShell({ slides, n, css }: { slides: ClientHeroSlide[]; n: number; css: string }) {
  return (
    <Card className="flex-none overflow-hidden p-0">
      <section
        className="modonty-hero-slides relative aspect-[1200/630] w-full bg-card"
        aria-label="من شركائنا"
        aria-roledescription="carousel"
      >
        {slides.map((s) => (
          <Link
            key={s.slug}
            href={`/clients/${encodeURIComponent(s.slug)}`}
            className="modonty-hero-slide absolute inset-0"
            aria-label={s.name}
          >
            {/* Hero fills the card (same treatment as the article client card) with a
                slow cinematic breathe. Cropped to fill → the logo badge below keeps the
                partner identity even when the banner's own logo is outside the crop. */}
            <Image
              src={s.heroImage}
              alt={s.name}
              fill
              sizes="300px"
              className="modonty-hero-ken object-cover"
            />
            {/* Identity overlay — text (start) + partner logo badge (end). */}
            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-3 pb-3 pt-10">
              <span className="min-w-0">
                <span className="mb-0.5 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/75">
                  <span className="inline-block size-1.5 rounded-full bg-accent" aria-hidden />
                  من شركائنا
                </span>
                <span className="block truncate text-[15px] font-extrabold leading-tight text-white drop-shadow-sm">
                  {s.name}
                </span>
              </span>
              <span
                className={`grid size-11 shrink-0 place-items-center overflow-hidden bg-white shadow-lg ring-2 ring-white/90 ${BRAND_AVATAR_RADIUS}`}
                aria-hidden
              >
                {s.logo ? (
                  <Image
                    src={s.logo}
                    alt=""
                    width={44}
                    height={44}
                    sizes="44px"
                    className="size-full object-contain p-1"
                  />
                ) : (
                  <IconClients className="size-5 text-primary" />
                )}
              </span>
            </span>
          </Link>
        ))}

        {/* Position dots — CSS-synced with the active slide. */}
        {n > 1 && (
          <span className="absolute inset-x-0 top-2.5 z-[5] flex justify-center gap-1.5" aria-hidden>
            {slides.map((s) => (
              <span
                key={s.slug}
                className="modonty-hero-dot h-1 w-3 rounded-full bg-white/90 shadow"
              />
            ))}
          </span>
        )}

        {/* Per-slide timing bar — flush at the bottom edge, above all slides. */}
        {n > 1 && (
          <span className="absolute inset-x-0 bottom-0 z-[5] h-[3px] overflow-hidden bg-white/15" aria-hidden>
            <span className="modonty-hero-progress block h-full w-full origin-right bg-accent" />
          </span>
        )}

        <style dangerouslySetInnerHTML={{ __html: css }} />
      </section>
    </Card>
  );
}
