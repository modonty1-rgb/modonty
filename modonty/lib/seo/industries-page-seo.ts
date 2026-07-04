import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";

export interface IndustriesPageSeo {
  metadata: Metadata | null;
  jsonLd: string | null;
}

// Read cached Metadata + JSON-LD for the industries page from Settings (SOT).
// Does not build or mutate SEO – it only reads what admin flows cached.
export async function getIndustriesPageSeo(): Promise<IndustriesPageSeo> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");
  const settings = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: {
      industriesPageMetaTags: true,
      industriesPageJsonLdStructuredData: true,
    },
  });

  if (!settings) {
    return { metadata: null, jsonLd: null };
  }

  const raw = settings.industriesPageMetaTags as Record<string, unknown> | null;
  const { viewport: _v, themeColor: _t, ...metaOnly } = raw ?? {};
  const metadata = (Object.keys(metaOnly).length ? metaOnly : null) as Metadata | null;

  const rawJsonLd = settings.industriesPageJsonLdStructuredData;
  const jsonLd =
    typeof rawJsonLd === "string" && rawJsonLd.trim().length > 0 ? rawJsonLd : null;

  return { metadata, jsonLd };
}
