import Image from "next/image";

import { IconCheck, IconShield } from "@/lib/icons";

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
  heroImageMedia?: { url: string } | null;
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

  return (
    <section className="relative w-full">
      {/* Cover — partner hero image when set, gradient fallback otherwise */}
      <div className="relative h-[170px] overflow-hidden bg-gradient-to-br from-foreground via-[#2422b8] to-primary">
        {client.heroImageMedia?.url ? (
          <>
            <Image
              src={client.heroImageMedia.url}
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

        {pageState !== "not-ready" && (
          <span className="absolute top-3.5 end-4 inline-flex items-center gap-1.5 rounded-full border border-accent/50 bg-white/95 px-3 py-1 text-[11px] font-extrabold text-foreground">
            <IconShield className="h-3.5 w-3.5 text-accent" />
            موثّق من مدوّنتي
          </span>
        )}
      </div>

      {/* White hero card overlapping the cover */}
      <div className="mx-auto max-w-[1128px] px-4">
        <div className="relative z-[2] -mt-10 rounded-lg border border-border bg-card p-[18px] shadow-sm">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative -mt-12 h-[90px] w-[90px] flex-shrink-0 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
              {client.logoMedia?.url ? (
                <Image
                  src={client.logoMedia.url}
                  alt={client.name}
                  fill
                  className="object-contain p-1"
                  sizes="90px"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-foreground to-accent text-3xl font-black text-white">
                  {initials}
                </span>
              )}
            </div>

            {/* Name + tagline + chips */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[22px] font-black leading-tight tracking-tight text-foreground">
                  {client.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-[11.5px] font-extrabold text-accent">
                  <IconCheck className="h-3.5 w-3.5" />
                  موثّق
                </span>
              </div>

              {tagline && (
                <p className="mt-1 text-[13px] text-muted-foreground">{tagline}</p>
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
