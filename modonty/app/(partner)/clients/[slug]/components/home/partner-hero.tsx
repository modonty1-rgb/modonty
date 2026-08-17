import type { ReactNode } from "react";
import { OptimizedImage } from "@modonty/shared/components/optimized-image";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { WhatsAppAction } from "@/components/shared/whatsapp-action/WhatsAppAction";
import { IconShieldCheck } from "@/lib/icons";
import type { PartnerSite } from "../../helpers/get-partner-site";

interface PartnerHeroProps {
  site: PartnerSite;
  rating: { average: number; count: number };
  /** The request card (BookingCard behind Suspense) — the hero itself stays static. */
  requestSlot: ReactNode;
}

const YEAR_FMT = new Intl.DateTimeFormat("ar-SA", { year: "numeric" });

/**
 * The partner's cover is a designed 6:1 poster (2400×400 today, with its own text), so it
 * is shown WHOLE — never cropped into a background. Under it, a deck in the partner's dark
 * tone carries the name, promise and the request card; behind the deck a blurred copy of
 * the same cover, so the hero's colours follow whatever cover the partner uploads.
 */
export function PartnerHero({ site, rating, requestSlot }: PartnerHeroProps) {
  const cover = site.heroImageMedia;
  const coverSrc = cover ? mediaSrc(cover) : null;
  const founded = site.foundingDate ? YEAR_FMT.format(site.foundingDate) : null;
  const isVerified = Boolean(site.commercialRegistrationNumber || site.legalName || site.verificationImageUrl);
  const headline = site.description?.split("\n")[0]?.trim() || site.slogan || site.name;
  const sub = site.description?.split("\n").slice(1).join(" ").trim() || (site.description ? site.slogan : site.seoDescription);

  return (
    <section className="relative overflow-hidden bg-[#0b1f3a] text-white">
      {coverSrc ? (
        <div
          aria-hidden
          className="absolute inset-0 scale-125 bg-cover bg-center opacity-40 blur-3xl saturate-125"
          style={{ backgroundImage: `url("${coverSrc}")` }}
        />
      ) : null}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#0b1f3a]/20 via-[#0b1f3a]/85 to-[#0b1f3a]" />

      <div className="relative mx-auto max-w-[1216px] px-4 pt-6">
        {cover ? (
          <div className="relative w-full overflow-hidden rounded-b-3xl shadow-2xl" style={{ aspectRatio: `${cover.width ?? 2400} / ${cover.height ?? 400}` }}>
            <OptimizedImage media={cover} alt={`غلاف ${site.name}`} fill sizes="clientHero" loading="eager" className="object-cover" />
          </div>
        ) : null}

        <div className="grid items-start gap-10 pb-16 pt-10 lg:grid-cols-[1.25fr_400px] lg:gap-14">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {isVerified ? (
                <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 text-sm backdrop-blur">
                  <IconShieldCheck className="h-3.5 w-3.5 text-green-400" aria-hidden /> شريك موثّق في مدونتي
                </span>
              ) : null}
              {rating.count > 0 ? (
                <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 text-sm backdrop-blur">
                  ⭐ {rating.average.toLocaleString("ar-SA", { maximumFractionDigits: 1 })} · {rating.count.toLocaleString("ar-SA")} رأياً
                </span>
              ) : null}
              {site.industry?.name ? <span className="inline-flex h-8 items-center rounded-full border border-white/25 bg-white/10 px-3 text-sm backdrop-blur">{site.industry.name}</span> : null}
              {site.addressCity ? <span className="inline-flex h-8 items-center rounded-full border border-white/25 bg-white/10 px-3 text-sm backdrop-blur">📍 {site.addressCity}</span> : null}
              {founded ? <span className="inline-flex h-8 items-center rounded-full border border-white/25 bg-white/10 px-3 text-sm backdrop-blur">منذ {founded}</span> : null}
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.15] tracking-tight md:text-[46px]">{headline}</h1>
            {sub ? <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/80">{sub}</p> : null}
            {site.slogan && headline !== site.slogan && sub !== site.slogan ? (
              <p className="mt-3 text-base text-white/65">{site.slogan}</p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {site.phone ? (
                <WhatsAppAction phone={site.phone} clientId={site.id} clientName={site.name} source="client_page" variant="solid" label="كلّمنا واتساب" />
              ) : null}
              {site.services.length > 0 ? (
                <a href="#services" className="inline-flex h-11 items-center rounded-full border border-white/35 bg-white/10 px-5 text-sm font-medium backdrop-blur hover:bg-white/20">
                  شوف الخدمات ↓
                </a>
              ) : null}
            </div>
          </div>

          <div className="text-foreground">{requestSlot}</div>
        </div>
      </div>
    </section>
  );
}
