import { HeroCover } from "./hero-cover";
import { HeroAvatar } from "./hero-avatar";
import { HeroNameRow } from "./hero-name-row";
import { HeroMeta } from "./hero-meta";
import { HeroCta } from "./hero-cta";
import { getCoverImage, getInitials, getTagline, getSocialPlatform } from "./utils";
import type { ClientHeroClient } from "./types";
import type { ClientHeroStats } from "./types";

export interface ClientHeroProps {
  client: ClientHeroClient;
  stats: ClientHeroStats;
  initialIsFollowing?: boolean;
}

export function ClientHero({ client, stats, initialIsFollowing = false }: ClientHeroProps) {
  const coverImage = getCoverImage(client);
  const initials = getInitials(client.name);
  const tagline = getTagline(client);
  const socialLinks = client.sameAs
    .map((url) => ({ url, platform: getSocialPlatform(url) }))
    .filter((link): link is { url: string; platform: NonNullable<ReturnType<typeof getSocialPlatform>> } => link.platform !== null);

  return (
    <div className="relative w-full">
      <HeroCover clientName={client.name} coverImage={coverImage} />
      <div className="container mx-auto max-w-[1128px] relative -mt-3 sm:-mt-4 md:-mt-6 px-4 sm:px-6 md:px-10 py-3 sm:py-4 rounded-lg shadow-sm bg-background border border-border flex flex-col md:flex-row md:items-end md:justify-between gap-3 sm:gap-4 translate-y-3 sm:translate-y-4 md:translate-y-6">
        <div className="flex items-end gap-2 sm:gap-4 min-w-0 flex-1">
          <HeroAvatar client={client} initials={initials} />
          <div className="flex flex-col gap-1 min-w-0 overflow-hidden">
            <HeroNameRow clientName={client.name} />
            <HeroMeta client={client} stats={stats} tagline={tagline} />
          </div>
        </div>
        <div className="w-full min-w-0 md:w-auto md:flex-shrink-0">
          <HeroCta
            client={client}
            stats={stats}
            socialLinks={socialLinks}
            initialIsFollowing={initialIsFollowing}
          />
        </div>
      </div>
    </div>
  );
}
