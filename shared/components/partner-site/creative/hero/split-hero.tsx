import { OptimizedImage, asMedia } from "../../../optimized-image";
import { PartnerAvatar } from "../../../partner-avatar/PartnerAvatar";
import { HeroActions } from "../../free/hero/parts/hero-actions";
import type { HomeData } from "../../free/home/home-data";

/**
 * «الغلاف المقسوم» — the creative theme's cover: the promise and the buttons on the start side,
 * the partner's cover in a soft rounded frame on the end side, over a quiet glow of his colour.
 * Same rules as every hero (THEMES.md §6 · modonty-uiux §3): the h1 names the partner, the
 * buttons come from HeroActions, the image is the LCP (eager, high priority), and a partner
 * without a cover still gets a composed band.
 */
export function SplitHero({ data, preview = false }: { data: HomeData; preview?: boolean }) {
  const { hero } = data;
  const meta = [hero.industry, hero.city, hero.foundingYear ? `منذ ${hero.foundingYear}` : null].filter(Boolean).join(" · ");
  const intro = hero.description && hero.description.trim() !== (data.about.description ?? "").trim() ? hero.description : null;
  const ratio = hero.coverWidth && hero.coverHeight ? `${hero.coverWidth} / ${hero.coverHeight}` : "4 / 3";
  // A banner (wider than ~1.8:1) usually carries the partner's own text and logo — cropping it to
  // fit half the row cuts them, and keeping its ratio makes it a thin strip (measured: a 3:1 cover
  // came out 495×82 beside the text). Wide covers span the row under the text instead, uncropped.
  const wide = Boolean(hero.coverWidth && hero.coverHeight && hero.coverWidth / hero.coverHeight > 1.8);

  return (
    <section id="hero" className="relative overflow-hidden bg-background">
      {/* The glow is decoration in the partner's colour — behind everything, never under text contrast. */}
      <div aria-hidden className="pointer-events-none absolute -top-40 end-[-15%] h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-3xl" />
      <div className={`relative mx-auto grid max-w-[1128px] items-center gap-10 px-6 py-[var(--ps-section-y,3rem)] md:py-[var(--ps-section-y-md,4rem)] ${wide ? "" : "md:grid-cols-[1.1fr_1fr]"}`}>
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <PartnerAvatar media={hero.logoUrl ? asMedia(hero.logoUrl, data.name) : null} name={data.name} size="standard" className="shrink-0" />
            <div className="min-w-0 text-sm">
              {hero.slogan ? <h1 className="font-bold text-foreground">{data.name}</h1> : null}
              {meta && <p className="text-muted-foreground">{meta}</p>}
            </div>
          </div>
          {hero.slogan ? (
            <p className="mt-6 text-balance text-4xl font-bold leading-tight text-foreground md:text-5xl">{hero.slogan}</p>
          ) : (
            <h1 className="mt-6 text-balance text-4xl font-bold leading-tight text-foreground md:text-5xl">{data.name}</h1>
          )}
          {intro && <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground line-clamp-3">{intro}</p>}
          <HeroActions data={data} preview={preview} className="mt-8 flex flex-wrap items-center gap-3" />
        </div>
        {hero.coverUrl ? (
          <div className="relative overflow-hidden rounded-[var(--ps-radius-card,0.5rem)] bg-muted ring-1 ring-border" style={{ aspectRatio: ratio }}>
            <OptimizedImage media={asMedia(hero.coverUrl, data.name)} alt="" fill sizes={wide ? "(max-width: 1128px) 100vw, 1080px" : "(max-width: 768px) 100vw, 540px"} className={wide ? "object-contain" : "object-cover"} fetchPriority="high" loading="eager" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
