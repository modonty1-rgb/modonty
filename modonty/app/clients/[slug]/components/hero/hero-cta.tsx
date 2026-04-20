import dynamic from "next/dynamic";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { ClientFollowButton } from "../client-follow-button";
import { ShareClientButtonWrapper } from "../share-client-button-wrapper";
import { IconMessage } from "@/lib/icons";
import type { ClientHeroClient, ClientHeroStats, ClientHeroSocialLink } from "./types";

const CtaVisitWebsite = dynamic(() =>
  import("./hero-cta-visit-website").then((m) => ({ default: m.CtaVisitWebsite }))
);

function CtaSocialLinks({ socialLinks, clientId }: { socialLinks: ClientHeroSocialLink[]; clientId: string }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
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
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        >
          <span aria-hidden="true" className="[&>svg]:h-3.5 [&>svg]:w-3.5">{link.platform.icon}</span>
          <span>{link.platform.name}</span>
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
      <Link href={`/clients/${encodeURIComponent(client.slug)}/contact`} className="flex-1 md:flex-none">
        <Button size="default" className="gap-2 w-full md:w-auto">
          <IconMessage className="h-4 w-4" />
          اسأل العميل
        </Button>
      </Link>
      <ClientFollowButton
        clientSlug={client.slug}
        initialIsFollowing={initialIsFollowing}
        initialFollowersCount={stats.followers}
        variant="outline"
        size="default"
        className="flex-1 md:flex-none"
      />
      <ShareClientButtonWrapper
        clientName={client.name}
        clientUrl={`/clients/${encodeURIComponent(client.slug)}`}
        clientId={client.id}
        clientSlug={client.slug}
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
    <div className="flex flex-col items-end gap-3 md:ps-4 md:border-s md:border-border">
      {socialLinks.length > 0 && (
        <CtaSocialLinks socialLinks={socialLinks} clientId={client.id} />
      )}
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
