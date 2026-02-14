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

      <div className="container mx-auto max-w-[1128px] px-4 relative -mt-4 md:-mt-6">
        <div className="bg-background border border-border rounded-lg shadow-sm px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4 translate-y-4 md:translate-y-6">
          <div className="flex items-end gap-4 ">
            <HeroAvatar client={client} initials={initials} />
            <div className="flex flex-col gap-1 min-w-0 ">
              <HeroNameRow clientName={client.name} />
              <HeroMeta client={client} stats={stats} tagline={tagline} />
            </div>
          </div>
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
