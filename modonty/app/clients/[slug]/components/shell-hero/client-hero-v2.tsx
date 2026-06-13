import Image from "next/image";

import { BRAND_AVATAR_RADIUS } from "@/lib/brand-avatar";
import { IconCheck } from "@/lib/icons";
import { stripCloudinaryTransforms } from "@/lib/image-utils";

import { getInitials, getTagline, getSocialPlatform } from "../hero/utils";
import { HeroChips } from "./hero-chips";
import { HeroStats } from "./hero-stats";
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
}

// Teal radial glow + diagonal stripes — matches mockup .cover::before
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
  // Mobile: the cover box height FOLLOWS the image's own aspect ratio, so object-cover
  // fills it exactly — no letterbox bands (box taller than image) and no crop. Clamped
  // by max-h so a tall/square cover can't dominate the screen. Desktop keeps the fixed
  // banner height (sm:h-[170px]).
  const heroAr = hero?.width && hero?.height ? hero.width / hero.height : 2.4;

  return (
    <section className="relative w-full">
      {/* Cover — partner hero image when set, gradient fallback otherwise */}
      <div
        className={
          heroSrc
            ? "relative w-full overflow-hidden bg-gradient-to-br from-foreground via-[#2422b8] to-primary aspect-[var(--hero-ar)] max-h-[300px] sm:aspect-auto sm:h-[170px] sm:max-h-none"
            : "relative h-[170px] w-full overflow-hidden bg-gradient-to-br from-foreground via-[#2422b8] to-primary"
        }
        style={heroSrc ? ({ "--hero-ar": heroAr } as React.CSSProperties) : undefined}
      >
        {heroSrc ? (
          <>
            <Image
              // Strip baked-in Cloudinary transforms (w_auto) — let next/image size it,
              // else Next fetches a tiny source server-side and the cover is blurry.
              src={stripCloudinaryTransforms(heroSrc) ?? heroSrc}
              alt={`غلاف ${client.name}`}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            {/* scrim keeps the badges readable over any image */}
            <div
              className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/45"
              aria-hidden="true"
            />
          </>
        ) : (
          <div className="absolute inset-0" style={COVER_OVERLAY} aria-hidden="true" />
        )}

        {featured && (
          <span className="absolute top-3.5 start-4 inline-flex items-center gap-1.5 rounded-full border border-accent/55 bg-white/15 px-3 py-1 text-[11px] font-extrabold text-white backdrop-blur-sm">
            ⭐ شريك مميّز
          </span>
        )}
        {/* «موثّق من مدوّنتي» cover badge removed — verification now lives as a
            checkmark on the client logo (no duplicate). */}
      </div>

      {/* White hero card overlapping the cover — compact on mobile, full on desktop */}
      <div className="mx-auto max-w-[1128px] px-4">
        <div className="relative z-[2] -mt-2 rounded-lg border border-border bg-card p-4 shadow-sm sm:-mt-10 sm:p-[18px]">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Avatar + verified checkmark — DESKTOP only: on mobile the logo lives in
                the sticky bottom bar (ClientBottomBar), so it isn't duplicated here. */}
            <div className="relative -mt-5 hidden flex-shrink-0 sm:-mt-12 lg:block">
              <div className={`relative h-16 w-16 overflow-hidden ${BRAND_AVATAR_RADIUS} border-[3px] border-card bg-card shadow-md sm:h-[88px] sm:w-[88px] sm:border-4`}>
                {client.logoMedia?.url ? (
                  <Image
                    src={stripCloudinaryTransforms(client.logoMedia.url) ?? client.logoMedia.url}
                    alt={client.name}
                    fill
                    className="object-contain p-1"
                    sizes="(min-width: 640px) 88px, 64px"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-foreground to-accent text-2xl font-black text-white sm:text-3xl">
                    {initials}
                  </span>
                )}
              </div>
              <span
                className="absolute -bottom-1 -start-1 grid h-6 w-6 place-items-center rounded-full border-2 border-card bg-accent text-white shadow-sm sm:h-7 sm:w-7"
                aria-label="موثّق من مدوّنتي"
                title="موثّق من مدوّنتي"
              >
                <IconCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
            </div>

            {/* Name + tagline + chips */}
            <div className="min-w-0 flex-1 pt-0.5">
              <h1 className="text-[18px] font-black leading-snug tracking-tight text-foreground sm:text-[22px]">
                {client.name}
              </h1>

              {tagline && (
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground sm:text-[13px]">
                  {tagline}
                </p>
              )}

              <HeroChips client={client} />
            </div>
          </div>

          <HeroStats stats={stats} pageState={pageState} />

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
      </div>
    </section>
  );
}
