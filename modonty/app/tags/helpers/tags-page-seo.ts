import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";

export interface TagsPageSeo {
  metadata: Metadata | null;
  jsonLd: string | null;
}

// Read cached Metadata + JSON-LD for the tags page from Settings (SOT) — same
// pattern as getCategoriesPageSeo(). Does not build or mutate SEO, only reads
// what the admin's listing-page-seo-generator cached.
export async function getTagsPageSeo(): Promise<TagsPageSeo> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");
  const settings = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: {
      tagsPageMetaTags: true,
      tagsPageJsonLdStructuredData: true,
    },
  });

  if (!settings) {
    return { metadata: null, jsonLd: null };
  }

  const raw = settings.tagsPageMetaTags as Record<string, unknown> | null;
  const { viewport: _v, themeColor: _t, ...metaOnly } = raw ?? {};
  const metadata = (Object.keys(metaOnly).length ? metaOnly : null) as Metadata | null;

  const rawJsonLd = settings.tagsPageJsonLdStructuredData;
  const jsonLd =
    typeof rawJsonLd === "string" && rawJsonLd.trim().length > 0
      ? rawJsonLd
      : null;

  return { metadata, jsonLd };
}
