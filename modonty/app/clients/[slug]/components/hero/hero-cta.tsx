import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { ClientFollowButton } from "../client-follow-button";
import { ShareClientButtonWrapper } from "../share-client-button-wrapper";
import type { ClientHeroClient, ClientHeroStats, ClientHeroSocialLink } from "./types";

function CtaSocialLinks({ socialLinks }: { socialLinks: ClientHeroSocialLink[] }) {
  return (
    <div className="flex items-center gap-2">
      {socialLinks.map((link, index) => (
        <Link
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
          aria-label={link.platform.name}
        >
          {link.platform.icon}
        </Link>
      ))}
    </div>
  );
}

function CtaVisitWebsite({ url }: { url: string }) {
  return (
    <Link href={url} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none">
      <Button size="default" className="gap-2 w-full md:w-auto">
        <Globe className="h-4 w-4" />
        زيارة الموقع
      </Button>
    </Link>
  );
}

function CtaShareAndFollow({
  client,
  stats,
  initialIsFollowing,
}: {
  client: ClientHeroClient;
  stats: ClientHeroStats;
  initialIsFollowing: boolean;
}) {
  return (
    <>
      <ShareClientButtonWrapper
        clientName={client.name}
        clientUrl={`/clients/${encodeURIComponent(client.slug)}`}
      />
      <ClientFollowButton
        clientSlug={client.slug}
        initialIsFollowing={initialIsFollowing}
        initialFollowersCount={stats.followers}
        variant="outline"
        size="default"
        className="flex-1 md:flex-none"
      />
    </>
  );
}

interface HeroCtaProps {
  client: ClientHeroClient;
  stats: ClientHeroStats;
  socialLinks: ClientHeroSocialLink[];
  initialIsFollowing: boolean;
}

export function HeroCta({ client, stats, socialLinks, initialIsFollowing }: HeroCtaProps) {
  return (
    <div className="flex flex-col items-end gap-4 md:gap-5 md:pl-4 md:border-s md:border-border">
      <CtaSocialLinks socialLinks={socialLinks} />
      <div className="flex items-center gap-3 md:gap-2">
        {client.url && <CtaVisitWebsite url={client.url} />}
        <CtaShareAndFollow
          client={client}
          stats={stats}
          initialIsFollowing={initialIsFollowing}
        />
      </div>
    </div>
  );
}
