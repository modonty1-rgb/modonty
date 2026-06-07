import Image from "next/image";
import Link from "@/components/link";
import { Card } from "@/components/ui/card";
import type { ClientHeroSlide } from "@/app/api/helpers/client-queries";

// Pure-CSS crossfade slider — Server Component, zero client JS.
// Mixed-aspect hero images are shown full (object-contain, never cropped); the
// letterbox area is filled by a blurred, color-coherent copy of the same image
// (Netflix/Spotify pattern) so nothing looks empty regardless of source ratio.
const PER_SLIDE = 4.5; // seconds each slide stays in focus

export function HeroSlider({ slides }: { slides: ClientHeroSlide[] }) {
  if (slides.length === 0) return null;

  const n = slides.length;
  const duration = (n * PER_SLIDE).toFixed(1);
  const slice = 100 / n;
  const cf = Math.min(8, slice * 0.25); // crossfade window (% of full cycle)
  const p = (v: number) => v.toFixed(3);

  // Slides crossfade; position dots pulse in sync. Overlap (slice→slice+cf with
  // the next fade-in) means the box never goes dark between slides.
  // visibility + pointer-events are driven from the keyframe so ONLY the active
  // slide is clickable and in the tab order — stacked links never intercept each
  // other (the click always lands on the partner you actually see).
  const off = slice + cf; // end of the fade-out window
  const offHide = Math.min(off + 0.01, 99.9); // flip to hidden right after fade-out
  const css =
    `.modonty-hero-slide{opacity:0;visibility:hidden;pointer-events:none}` +
    `.modonty-hero-slide:first-child{opacity:1;visibility:visible;pointer-events:auto}` +
    (n > 1
      ? `@keyframes modontyHeroFade{0%{opacity:0;visibility:visible;pointer-events:none}${p(cf)}%{opacity:1;pointer-events:auto}${p(slice)}%{opacity:1;pointer-events:auto}${p(off)}%{opacity:0;visibility:visible;pointer-events:none}${p(offHide)}%{visibility:hidden}100%{opacity:0;visibility:hidden;pointer-events:none}}` +
        `@keyframes modontyHeroDot{0%{opacity:.35;transform:scaleX(1)}${p(cf)}%{opacity:1;transform:scaleX(2.4)}${p(slice)}%{opacity:1;transform:scaleX(2.4)}${p(off)}%{opacity:.35;transform:scaleX(1)}100%{opacity:.35;transform:scaleX(1)}}` +
        // forwards (not both): during the initial stagger delay each slide shows
        // its static state (hidden/non-clickable), not the 0% keyframe.
        `.modonty-hero-slide{animation:modontyHeroFade ${duration}s infinite forwards}` +
        `.modonty-hero-dot{animation:modontyHeroDot ${duration}s infinite both}` +
        `.modonty-hero-slides:hover .modonty-hero-slide,.modonty-hero-slides:hover .modonty-hero-dot,.modonty-hero-slides:focus-within .modonty-hero-slide,.modonty-hero-slides:focus-within .modonty-hero-dot{animation-play-state:paused}` +
        slides
          .map((_, i) => {
            const d = (i * PER_SLIDE).toFixed(2);
            return `.modonty-hero-slide:nth-child(${i + 1}){animation-delay:${d}s}.modonty-hero-dot:nth-child(${i + 1}){animation-delay:${d}s}`;
          })
          .join("") +
        // Reduced-motion: slow the rotation right down (keeps every partner
        // reachable) instead of forcing motion or freezing on one.
        `@media (prefers-reduced-motion:reduce){.modonty-hero-slide,.modonty-hero-dot{animation-duration:${(n * 9).toFixed(1)}s}}`
      : "");

  return (
    <Card className="flex-none overflow-hidden p-0">
      <section
        className="modonty-hero-slides relative aspect-video w-full bg-card"
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
            {/* Color-coherent blurred backdrop — fills the letterbox area. */}
            <Image
              src={s.heroImage}
              alt=""
              aria-hidden
              fill
              sizes="64px"
              className="scale-125 object-cover blur-xl"
            />
            <span className="absolute inset-0 bg-black/25" aria-hidden />
            {/* Crisp, full image — never cropped. */}
            <Image
              src={s.heroImage}
              alt={s.name}
              fill
              sizes="300px"
              className="object-contain"
            />
            {/* Identity overlay. */}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-2.5 pt-9">
              <span className="block text-[10px] font-bold uppercase tracking-wide text-white/70">
                من شركائنا
              </span>
              <span className="block truncate text-sm font-bold text-white">{s.name}</span>
            </span>
          </Link>
        ))}

        {/* Position dots — CSS-synced with the active slide. */}
        {n > 1 && (
          <span className="absolute inset-x-0 top-2.5 z-10 flex justify-center gap-1.5" aria-hidden>
            {slides.map((s) => (
              <span
                key={s.slug}
                className="modonty-hero-dot h-1 w-3 rounded-full bg-white/90 shadow"
              />
            ))}
          </span>
        )}

        <style dangerouslySetInnerHTML={{ __html: css }} />
      </section>
    </Card>
  );
}
