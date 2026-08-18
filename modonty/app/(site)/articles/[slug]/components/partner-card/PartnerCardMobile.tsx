import { OptimizedImage } from "@modonty/shared/components/optimized-image";
import { VerifiedBadge } from "@modonty/shared/components/verified-badge/VerifiedBadge";
import { mediaSrc } from "@modonty/shared/lib/media-src";

import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { IconClients, IconChevronLeft } from "@/lib/icons";

interface PartnerCardMobileProps {
  client: {
    id: string;
    name: string;
    slug: string;
    addressCity?: string | null;
    logoMedia?: { url: string; bunnyUrl: string | null; blurDataURL: string | null } | null;
  };
  articleId: string;
}

// Mobile-only: compact, tappable client identity right under the title (instant trust).
// The client is the cornerstone deliverable — it must show inline, never hidden in a sheet.
export function PartnerCardMobile({ client, articleId }: PartnerCardMobileProps) {
  // Keep the ROW so OptimizedImage can read the stored blur off it.
  const logoMedia = mediaSrc(client.logoMedia) ? client.logoMedia : null;

  return (
    <CtaTrackedLink
      href={`/clients/${client.slug}`}
      label={client.name}
      type="LINK"
      articleId={articleId}
      clientId={client.id}
      className="mt-3 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-2.5 lg:hidden"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background ring-1 ring-border">
        {logoMedia ? (
          <OptimizedImage media={logoMedia} alt={client.name} width={44} height={44} className="object-contain p-1" sizes="44px" />
        ) : (
          <IconClients className="h-5 w-5 text-muted-foreground" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-[15px] font-bold leading-tight text-foreground">
          {client.name}
          <VerifiedBadge className="h-4 w-4" label="شريك موثّق" />
        </span>
        <span className="mt-0.5 block text-[11px] text-muted-foreground">
          {client.addressCity?.trim() ? `${client.addressCity} · ` : ""}موثّق من مدونتي
        </span>
      </span>
      <IconChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
    </CtaTrackedLink>
  );
}
