import { db } from "@/lib/db";
import type { Metadata } from "next";

export interface ClientsPageSeo {
  metadata: Metadata | null;
  jsonLd: string | null;
}

// Read cached Metadata + JSON-LD for the clients page from Settings (SOT).
// Does not build or mutate SEO – it only reads what admin flows cached.
export async function getClientsPageSeo(): Promise<ClientsPageSeo> {
  const settings = await db.settings.findFirst({
    select: {
      clientsPageMetaTags: true,
      clientsPageJsonLdStructuredData: true,
    },
  });

  if (!settings) {
    return { metadata: null, jsonLd: null };
  }

  const raw = settings.clientsPageMetaTags as Record<string, unknown> | null;
  const { viewport: _v, themeColor: _t, ...metaOnly } = raw ?? {};
  const metadata = (Object.keys(metaOnly).length ? metaOnly : null) as Metadata | null;

  const rawJsonLd = settings.clientsPageJsonLdStructuredData;
  const jsonLd =
    typeof rawJsonLd === "string" && rawJsonLd.trim().length > 0
      ? rawJsonLd
      : null;

  return { metadata, jsonLd };
}


