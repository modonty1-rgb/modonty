import { mediaSrc } from "@modonty/shared/lib/media-src";
import { generateStructuredData } from "@/lib/seo";
import type { getClientPageData } from "./get-client-page-data";

type ClientPageClient = NonNullable<Awaited<ReturnType<typeof getClientPageData>>>["client"];

/** Organization JSON-LD built live when the partner has no cached bundle yet. */
export function buildFallbackOrganization(client: ClientPageClient, slug: string) {
  return generateStructuredData({
    type: "Client",
    name: client.name,
    description: client.description || client.seoDescription || undefined,
    url: client.url || `/clients/${encodeURIComponent(slug)}`,
    image: mediaSrc(client.logoMedia) || mediaSrc(client.heroImageMedia) || undefined,
    "@type": "Organization",
    legalName: client.legalName || undefined,
    email: client.email || undefined,
    telephone: client.phone || undefined,
    sameAs: client.sameAs.length > 0 ? client.sameAs : undefined,
    foundingDate: client.foundingDate
      ? (typeof client.foundingDate === "string" ? (client.foundingDate as string).split("T")[0] : client.foundingDate.toISOString().split("T")[0])
      : undefined,
  });
}
