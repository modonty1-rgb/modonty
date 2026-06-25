import Image from "next/image";

import { IconCheck } from "@/lib/icons";
import { stripCloudinaryTransforms } from "@/lib/image-utils";

import { getInitials, getTagline, getSocialPlatform } from "../hero/utils";
import { HeroChips } from "./hero-chips";
import { HeroStats } from "./hero-stats";
import { HeroGoogleStat } from "./hero-google-stat";
import { HeroCtaRow } from "./hero-cta-row";

export type HeroPageState = "strong" | "sparse" | "not-ready";
export type HeroCtaMode = "FORM" | "LINK" | "NONE";

interface ClientHeroV2Client {
  id: string;
  name: string;
  slug: string;
  logoMedia?: { url: string } | null;
  heroImageMedia?: { url: string; width?: number | null; height?: number | null } | null;
  industry?: { name: string } | null;
  addressCity?: string | null;
  addressRegion?: string | null;
  addressCountry?: string | null;
  foundingDate?: Date | null;
  sameAs: string[];
  url?: string | null;
  phone?: string | null;
}

interface ClientHeroV2Stats {
  followers: number;
  articles: number;
  totalViews: number;
  rating: number;
  reviewCount: number;
}

export interface ClientHeroV2Props {
  client: ClientHeroV2Client;
  stats: ClientHeroV2Stats;
  pageState: HeroPageState;
  featured: boolean;
  ctaMode: HeroCtaMode;
  user: { name: string | null; email: string | null } | null;
  initialIsFollowing?: boolean;
  /** GA4 digital-impact total — drives the «موثّق من Google» box; 0 hides it. */
  digitalImpact?: number;
}

// Teal radial glow + diagonal stripes — gradient-fallback cover when no image is set.
const COVER_OVERLAY: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(420px 220px at 88% -10%,rgba(0,216,216,.45),transparent 60%)," +
    "repeating-linear-gradient(45deg,rgba(255,255,255,.04) 0 14px,transparent 14px 28px)",
};

export function ClientHeroV2({
  client,
  stats,
  pageState,
  featured,
  ctaMode,
  user,
  initialIsFollowing = false,
  digitalImpact = 0,
}: ClientHeroV2Props) {
  const initials = getInitials(client.name);
  const tagline = getTagline(client);

  const socialLinks = client.sameAs
    .map((url) => ({ url, platform: getSocialPlatform(url) }))
    .filter(
      (link): link is { url: string; platform: NonNullable<ReturnType<typeof getSocialPlatform>> } =>
        link.platform !== null
    );

  const hero = client.heroImageMedia;
  const heroSrc = hero?.url ?? null;
  // The cover shows the FULL partner image (no white card overlap, no crop). Box height
  // follows the image's own aspect ratio so object-cover fills it exactly — a wide 6:1
  // banner stays a banner, a tall upload is clamped by max-h (only then object-cover trims).
  const heroAr = hero?.width && hero?.height ? hero.width / hero.height : 2.4;

  return (
    <section className="w-full">
      <div className="mx-auto max-w-[1128px] px-4">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {/* COVER — full partner image, no overlap */}
          <div
            className={
              heroSrc
                ? "relative w-full overflow-hidden bg-gradient-to-br from-foreground via-[#2422b8] to-primary aspect-[var(--hero-ar)] max-h-[300px] sm:max-h-[220px]"
                : "relative h-[140px] w-full overflow-hidden bg-gradient-to-br from-foreground via-[#2422b8] to-primary"
            }
            style={heroSrc ? ({ "--hero-ar": heroAr } as React.CSSProperties) : undefined}
          >
            {heroSrc ? (
              <Image
                // Strip baked-in Cloudinary transforms (w_auto) so next/image sizes it
                // properly — else Next fetches a tiny source and the cover is blurry.
                src={stripCloudinaryTransforms(heroSrc) ?? heroSrc}
                alt={`غلاف ${client.name}`}
                fill
                priority
                sizes="(max-width: 1128px) 100vw, 1096px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0" style={COVER_OVERLAY} aria-hidden="true" />
            )}

            {featured && (
              <span className="absolute top-3.5 start-4 inline-flex items-center gap-1.5 rounded-full border border-accent/55 bg-black/35 px-3 py-1 text-[11px] font-extrabold text-white backdrop-blur-sm">
                ⭐ شريك مميّز
              </span>
            )}
          </div>

          {/* INFO BAR — sits BELOW the cover (no overlap) */}
          <div className="p-4 sm:p-5">
            {/* DESKTOP: everything on one line */}
            <div className="hidden items-center gap-5 lg:flex">
              {/* Distinctive neutral logo frame (white ring + border + shadow — no brand-gradient
                  so the partner's own logo colors stay intact). */}
              <div className="relative flex-shrink-0">
                <div className="relative h-[70px] w-[70px] overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_6px_16px_rgba(0,0,0,0.12)] ring-4 ring-white">
                  {client.logoMedia?.url ? (
                    <Image
                      src={stripCloudinaryTransforms(client.logoMedia.url) ?? client.logoMedia.url}
                      alt={client.name}
                      fill
                      className="object-contain p-1.5"
                      sizes="70px"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-foreground to-accent text-3xl font-black text-white">
                      {initials}
                    </span>
                  )}
                </div>
                <span
                  className="absolute -bottom-1 -start-1 grid h-6 w-6 place-items-center rounded-full border-2 border-card bg-accent text-white shadow-sm"
                  aria-label="موثّق من مدوّنتي"
                  title="موثّق من مدوّنتي"
                >
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
              </div>

              {/* Name + tagline + chips */}
              <div className="min-w-0">
                <h1 className="truncate text-[20px] font-black leading-tight tracking-tight text-foreground">
                  {client.name}
                </h1>
                {tagline && (
                  <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{tagline}</p>
                )}
                <HeroChips client={client} />
              </div>

              <div className="mx-1 h-10 w-px flex-shrink-0 bg-border" aria-hidden="true" />

              <HeroStats stats={stats} pageState={pageState} layout="inline" className="flex-shrink-0" />

              {/* book / follow / share + social — desktop only (mobile uses ClientBottomBar) */}
              <div className="ms-auto flex-shrink-0">
                <HeroCtaRow
                  clientId={client.id}
                  clientName={client.name}
                  clientSlug={client.slug}
                  clientUrl={client.url ?? null}
                  ctaMode={ctaMode}
                  user={user}
                  followers={stats.followers}
                  initialIsFollowing={initialIsFollowing}
                  socialLinks={socialLinks}
                />
              </div>

              {/* «موثّق من Google» — standalone digital-impact box at the bar's end */}
              {digitalImpact > 0 && <HeroGoogleStat value={digitalImpact} />}
            </div>

            {/* MOBILE: stacked — logo + booking/follow/share live in the sticky ClientBottomBar */}
            <div className="lg:hidden">
              <h1 className="text-[18px] font-black leading-snug tracking-tight text-foreground">
                {client.name}
              </h1>
              {tagline && (
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{tagline}</p>
              )}
              <HeroChips client={client} />
              {/* stats strip + «موثّق من Google» box side-by-side (box at the strip's end) */}
              <div className="mt-3.5 flex items-stretch gap-2.5">
                <HeroStats stats={stats} pageState={pageState} layout="strip" className="flex-1" />
                {digitalImpact > 0 && <HeroGoogleStat value={digitalImpact} size="sm" />}
              </div>

              {/* social profile links (the action set lives in the sticky bottom bar) */}
              {socialLinks.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform.name}
                      className="grid h-[38px] w-[38px] place-items-center rounded-[9px] border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary [&>svg]:h-[18px] [&>svg]:w-[18px]"
                    >
                      <span aria-hidden="true">{link.platform.icon}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
