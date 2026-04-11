import dynamic from "next/dynamic";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { ClientFollowButton } from "../client-follow-button";
import { ShareClientButtonWrapper } from "../share-client-button-wrapper";
import type { ClientHeroClient, ClientHeroStats, ClientHeroSocialLink } from "./types";

const CtaVisitWebsite = dynamic(() =>
  import("./hero-cta-visit-website").then((m) => ({ default: m.CtaVisitWebsite }))
);

function CtaSocialLinks({ socialLinks, clientId }: { socialLinks: ClientHeroSocialLink[]; clientId: string }) {
  return (
    <div className="flex items-center gap-2">
      {socialLinks.map((link, index) => (
        <CtaTrackedLink
          key={index}
          href={link.url}
          label={`Social (${link.platform.name})`}
          type="LINK"
          clientId={clientId}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.platform.name}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <span aria-hidden="true">{link.platform.icon}</span>
        </CtaTrackedLink>
      ))}
    </div>
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
        clientId={client.id}
        clientSlug={client.slug}
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
      <CtaSocialLinks socialLinks={socialLinks} clientId={client.id} />
      <div className="flex items-center gap-3 md:gap-2">
        {client.url && <CtaVisitWebsite url={client.url} clientId={client.id} />}
        <CtaShareAndFollow
          client={client}
          stats={stats}
          initialIsFollowing={initialIsFollowing}
        />
      </div>
    </div>
  );
}
