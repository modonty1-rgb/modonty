import { db } from "@/lib/db";
import type { Metadata } from "next";

export interface TrendingPageSeo {
  metadata: Metadata | null;
  jsonLd: string | null;
}

// Read cached Metadata + JSON-LD for the trending page from Settings (SOT).
// Does not build or mutate SEO – it only reads what admin flows cached.
export async function getTrendingPageSeo(): Promise<TrendingPageSeo> {
  const settings = await db.settings.findFirst({
    select: {
      trendingPageMetaTags: true,
      trendingPageJsonLdStructuredData: true,
    },
  });

  if (!settings) {
    return { metadata: null, jsonLd: null };
  }

  const raw = settings.trendingPageMetaTags as Record<string, unknown> | null;
  const { viewport: _v, themeColor: _t, ...metaOnly } = raw ?? {};
  const metadata = (Object.keys(metaOnly).length ? metaOnly : null) as Metadata | null;

  const rawJsonLd = settings.trendingPageJsonLdStructuredData;
  const jsonLd =
    typeof rawJsonLd === "string" && rawJsonLd.trim().length > 0
      ? rawJsonLd
      : null;

  return { metadata, jsonLd };
}


