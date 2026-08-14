import { cacheTag, cacheLife } from "next/cache";

import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";

import type { Metadata } from "next";

/**
 * The SEVEN listing pages only — the ones whose SEO lives on the Settings singleton.
 * Article and client pages are NOT here: each stores its SEO on its own row and reads
 * it as part of the page's own query.
 */
export type ListingPageKey =
  | "home"
  | "categories"
  | "clients"
  | "industries"
  | "tags"
  | "trending"
  | "faq";

export interface ListingPageSeo {
  metadata: Metadata | null;
  jsonLd: string | null;
}

// One cached read of every listing page's SEO columns. Keyed by nothing, so all
// seven pages share a single entry instead of seven near-identical ones — they
// all invalidate together on cacheTag("settings") anyway.
async function readSettingsSeoColumns() {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");
  return db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: {
      homeMetaTags: true,
      jsonLdStructuredData: true,
      categoriesPageMetaTags: true,
      categoriesPageJsonLdStructuredData: true,
      clientsPageMetaTags: true,
      clientsPageJsonLdStructuredData: true,
      industriesPageMetaTags: true,
      industriesPageJsonLdStructuredData: true,
      tagsPageMetaTags: true,
      tagsPageJsonLdStructuredData: true,
      trendingPageMetaTags: true,
      trendingPageJsonLdStructuredData: true,
      faqPageMetaTags: true,
      faqPageJsonLdStructuredData: true,
    },
  });
}

type SettingsSeoColumns = NonNullable<Awaited<ReturnType<typeof readSettingsSeoColumns>>>;

interface RawSeoPair {
  meta: SettingsSeoColumns["homeMetaTags"];
  jsonLd: SettingsSeoColumns["jsonLdStructuredData"];
}

// The only thing that differs between pages: which column pair holds their SEO.
const SEO_COLUMNS: Record<ListingPageKey, (s: SettingsSeoColumns) => RawSeoPair> = {
  home: (s) => ({ meta: s.homeMetaTags, jsonLd: s.jsonLdStructuredData }),
  categories: (s) => ({
    meta: s.categoriesPageMetaTags,
    jsonLd: s.categoriesPageJsonLdStructuredData,
  }),
  clients: (s) => ({ meta: s.clientsPageMetaTags, jsonLd: s.clientsPageJsonLdStructuredData }),
  industries: (s) => ({
    meta: s.industriesPageMetaTags,
    jsonLd: s.industriesPageJsonLdStructuredData,
  }),
  tags: (s) => ({ meta: s.tagsPageMetaTags, jsonLd: s.tagsPageJsonLdStructuredData }),
  trending: (s) => ({ meta: s.trendingPageMetaTags, jsonLd: s.trendingPageJsonLdStructuredData }),
  faq: (s) => ({ meta: s.faqPageMetaTags, jsonLd: s.faqPageJsonLdStructuredData }),
};

// Reads the Metadata + JSON-LD that admin cached on Settings (source of truth).
// Never builds or mutates SEO — a null return is the caller's cue to serve its
// own fallback.
export async function getListingPageSeo(page: ListingPageKey): Promise<ListingPageSeo> {
  const settings = await readSettingsSeoColumns();
  if (!settings) {
    return { metadata: null, jsonLd: null };
  }

  const { meta, jsonLd: rawJsonLd } = SEO_COLUMNS[page](settings);

  // viewport/themeColor moved out of Metadata in Next 14 — strip them or Next warns.
  const { viewport: _viewport, themeColor: _themeColor, ...metaOnly } =
    (meta as Record<string, unknown> | null) ?? {};

  return {
    metadata: (Object.keys(metaOnly).length ? metaOnly : null) as Metadata | null,
    jsonLd: rawJsonLd && rawJsonLd.trim().length > 0 ? rawJsonLd : null,
  };
}
