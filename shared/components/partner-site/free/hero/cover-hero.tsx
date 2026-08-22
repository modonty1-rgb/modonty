import { OptimizedImage, asMedia } from "../../../optimized-image";
import { PartnerAvatar } from "../../../partner-avatar/PartnerAvatar";
import { WhatsAppButton } from "../../parts/whatsapp-button";
import type { HomeData } from "../home/home-data";

/**
 * «الغلاف» — the cover at its own ratio (never cropped), then ONE composed band under it:
 * the logo card riding up over the cover's bottom edge, the promise as the only large line,
 * one meta line, one supporting sentence, two actions. Without a cover the same band stands
 * on a quiet tinted ground so the page still opens with a focal point.
 */
export function CoverHero({ data }: { data: HomeData; preview?: boolean }) {
  const { hero } = data;
  const promise = hero.slogan || data.name;
  const meta = [hero.industry, hero.city, hero.foundingYear ? `منذ ${hero.foundingYear}` : null].filter(Boolean).join(" · ");
  const hasCover = Boolean(hero.coverUrl);

  return (
    <section className={hasCover ? "bg-background" : "bg-gradient-to-b from-primary/10 to-background"}>
      {hasCover && (
        <div
          className="relative w-full overflow-hidden bg-muted"
          style={{ aspectRatio: hero.coverWidth && hero.coverHeight ? `${hero.coverWidth} / ${hero.coverHeight}` : "3 / 1" }}
        >
          <OptimizedImage media={asMedia(hero.coverUrl!, data.name)} alt="" fill sizes="100vw" className="object-contain" fetchPriority="high" loading="eager" />
        </div>
      )}
      <div className={hasCover ? "mx-auto max-w-[1128px] px-6" : "mx-auto max-w-[1128px] px-6 pt-16"}>
        <div className="flex flex-col gap-6 pt-5 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 items-end gap-5">
            {/* Was a white square with a ring — the halo, and the square kept the white corners
                of a partner logo file visible. */}
            <PartnerAvatar
              media={hero.logoUrl ? asMedia(hero.logoUrl, data.name) : null}
              name={data.name}
              size="big"
              className={hasCover ? "-mt-16 md:-mt-20" : undefined}
            />
            <div className="min-w-0 pb-1">
              {meta && <p className="text-sm text-muted-foreground">{meta}</p>}
              <h1 className="mt-1 text-3xl font-bold leading-tight text-foreground md:text-4xl">{promise}</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 pb-1">
            <WhatsAppButton href={data.whatsappHref} />
            {data.phone && (
              <a href={`tel:${data.phone}`} className="inline-flex h-10 items-center rounded-full border px-5 text-sm font-medium text-foreground max-md:h-11">
                اتصل بنا
              </a>
            )}
          </div>
        </div>
        {hero.description && (
          <p className="mt-6 max-w-2xl pb-12 text-base leading-8 text-muted-foreground line-clamp-2">{hero.description}</p>
        )}
        {!hero.description && <div className="pb-12" />}
      </div>
    </section>
  );
}
