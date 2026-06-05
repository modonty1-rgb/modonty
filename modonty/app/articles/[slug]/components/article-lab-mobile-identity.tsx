import NextImage from "next/image";

import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { IconClients, IconVerified, IconChevronLeft } from "@/lib/icons";

interface ArticleLabMobileIdentityProps {
  client: {
    id: string;
    name: string;
    slug: string;
    addressCity?: string | null;
    logoMedia?: { url: string } | null;
  };
  articleId: string;
}

// Mobile-only: compact, tappable client identity right under the title (instant trust).
// The client is the cornerstone deliverable — it must show inline, never hidden in a sheet.
export function ArticleLabMobileIdentity({ client, articleId }: ArticleLabMobileIdentityProps) {
  const logoUrl = client.logoMedia?.url ?? null;

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
        {logoUrl ? (
          <NextImage src={logoUrl} alt={client.name} width={44} height={44} className="object-contain p-1" sizes="44px" />
        ) : (
          <IconClients className="h-5 w-5 text-muted-foreground" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-[15px] font-bold leading-tight text-foreground">
          {client.name}
          <IconVerified className="h-4 w-4 shrink-0 text-primary" aria-label="موثّق" />
        </span>
        <span className="mt-0.5 block text-[11px] text-muted-foreground">
          {client.addressCity?.trim() ? `${client.addressCity} · ` : ""}موثّق من مدونتي
        </span>
      </span>
      <IconChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
    </CtaTrackedLink>
  );
}
