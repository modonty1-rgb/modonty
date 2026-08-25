import { cacheTag, cacheLife } from "next/cache";

import { buildHreflangLanguages } from "@modonty/shared/lib/seo/build-hreflang-languages";

import { SITE_URL } from "@/constants";
import { db } from "@/lib/db";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
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
  | "faq"
  | "articles";

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
      articlesPageMetaTags: true,
      articlesPageJsonLdStructuredData: true,
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
  articles: (s) => ({ meta: s.articlesPageMetaTags, jsonLd: s.articlesPageJsonLdStructuredData }),
};

// Reads the Metadata + JSON-LD that admin cached on Settings (source of truth).
// Never builds or mutates SEO — a null return is the caller's cue to serve its
// own fallback. The one exception is hreflang, below.
export async function getListingPageSeo(page: ListingPageKey): Promise<ListingPageSeo> {
  const [settings, defaults] = await Promise.all([readSettingsSeoColumns(), getPageSeoDefaults()]);
  if (!settings) {
    return { metadata: null, jsonLd: null };
  }

  const { meta, jsonLd: rawJsonLd } = SEO_COLUMNS[page](settings);

  // viewport/themeColor moved out of Metadata in Next 14 — strip them or Next warns.
  const { viewport: _viewport, themeColor: _themeColor, ...metaOnly } =
    (meta as Record<string, unknown> | null) ?? {};

  if (!Object.keys(metaOnly).length) {
    return { metadata: null, jsonLd: rawJsonLd?.trim() ? rawJsonLd : null };
  }

  // hreflang is site-wide policy, not this page's content, so it is read live rather than
  // inherited from the blob. The blob is a cache the admin wrote at save time; these seven
  // pages were last generated when the generator hardcoded two locales, so they shipped
  // ar-SA + ar-EG and no x-default while Settings listed nine (measured 2026-08-15). Fixing
  // only the generator would leave them wrong until someone pressed regenerate on each.
  const alternates = (metaOnly.alternates ?? {}) as Record<string, unknown>;
  const canonical = typeof alternates.canonical === "string" ? alternates.canonical : SITE_URL;
  metaOnly.alternates = {
    ...alternates,
    canonical,
    languages: buildHreflangLanguages(defaults.alternateLanguages, canonical, SITE_URL),
  };

  return {
    metadata: metaOnly as Metadata,
    jsonLd: rawJsonLd && rawJsonLd.trim().length > 0 ? rawJsonLd : null,
  };
}
