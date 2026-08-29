/**
 * Build Tags / Industries page @graph JSON-LD from Settings + the taxonomy rows.
 *
 * Same shape as the Categories page builder (Organization + WebSite + CollectionPage with an
 * ItemList of Thing nodes) — tags and industries are flat taxonomies, so they need no `broader`.
 * Written so every modonty listing page goes through one validated generator instead of the thin
 * CollectionPage builder the listing generator used to fall back to.
 */

import { absoluteUrl, entityUrl } from "@modonty/shared/lib/seo/absolute-url";
import { requireSiteUrl } from "@modonty/shared/lib/seo/require-site-url";
import type { SettingsForHomeJsonLd } from "./build-home-jsonld-from-settings";
import { buildSiteOrgAndWebSite } from "./build-clients-page-jsonld";

function ensureAbsoluteUrl(url: string | null | undefined, siteUrl: string): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u.replace("http://", "https://");
  if (u.startsWith("/")) return absoluteUrl(u, siteUrl);
  return `https://${u}`;
}

const SCHEMA_CONTEXT = "https://schema.org";

export type TaxonomyPageType = "tags" | "industries";

export interface TaxonomyItemForJsonLd {
  name: string;
  slug: string;
  description?: string | null;
  seoDescription?: string | null;
  seoTitle?: string | null;
  socialImage?: string | null;
  socialImageAlt?: string | null;
  canonicalUrl?: string | null;
  id?: string | null;
}

const TAXONOMY_FALLBACKS: Record<
  TaxonomyPageType,
  { path: string; name: string; description: string }
> = {
  tags: {
    path: "/tags",
    name: "الوسوم",
    description: "تصفح المقالات حسب الوسم - كل الوسوم المتاحة على مدوّنتي.",
  },
  industries: {
    path: "/industries",
    name: "القطاعات",
    description: "استكشف الشركات والمحتوى حسب القطاع - كل القطاعات المتاحة.",
  },
};

function itemToListItem(
  item: TaxonomyItemForJsonLd,
  basePath: string,
  siteUrl: string,
  index: number
): Record<string, unknown> {
  const profileUrl = entityUrl(basePath, item.slug, siteUrl);
  const url = item.canonicalUrl?.trim() || profileUrl;
  const absUrl = ensureAbsoluteUrl(url, siteUrl) || profileUrl;
  const absImage = item.socialImage ? ensureAbsoluteUrl(item.socialImage, siteUrl) : undefined;

  const thing: Record<string, unknown> = {
    "@type": "Thing",
    "@id": profileUrl,
    name: item.name,
    url: absUrl,
    mainEntityOfPage: profileUrl,
  };

  const desc = (item.description ?? item.seoDescription)?.trim();
  if (desc) thing.description = desc;
  if (item.seoTitle?.trim() && item.seoTitle !== item.name) {
    thing.alternateName = item.seoTitle.trim();
  }
  if (absImage) {
    thing.image = {
      "@type": "ImageObject",
      url: absImage,
      // No width/height: nothing here measured this file. The pair was a literal 1200x630 on every
      // image — measured 25 Aug 2026 across four category images, two of them 2048x2048 squares. A
      // declared size that is not the file’s is worse than none: schema.org ImageObject width/height
      // describe the actual image, and a consumer that trusts them lays out a crop that does not
      // exist. Omitted until the row carries real dimensions — the same rule the modonty side applies
      // in withHonestOpenGraphImageDimensions.
      ...(item.socialImageAlt?.trim() && { caption: item.socialImageAlt.trim() }),
    };
  }
  // No `identifier`: this used to ship the raw Mongo _id into public JSON-LD (measured
  // 25 Aug 2026 — 20 on /tags, 8 on /industries). It is an internal primary key, it means
  // nothing to any consumer, and schema.org identifiers are meant to be identifiers the
  // outside world can resolve. The entity is already identified by its absolute `url`.

  return {
    "@type": "ListItem",
    position: index + 1,
    item: thing,
  };
}

export function buildTaxonomyPageJsonLd(
  settings: SettingsForHomeJsonLd,
  pageType: TaxonomyPageType,
  items: TaxonomyItemForJsonLd[],
  totalCount: number,
  // `null` when the list is empty. An empty listing page has no content date, and the
  // caller used to pass `new Date()` for it — a page announcing it changed today because it
  // has nothing on it. Absent stays absent, the same rule the per-item dates below follow.
  dateModified: Date | null
): object {
  const siteUrl = requireSiteUrl(settings.siteUrl).replace(/\/$/, "");
  const fallback = TAXONOMY_FALLBACKS[pageType];
  const pageUrl = absoluteUrl(fallback.path, siteUrl);
  const { org, website, inLangCodes } = buildSiteOrgAndWebSite(settings, siteUrl);

  const titleMap = {
    tags: settings.tagsSeoTitle,
    industries: settings.industriesSeoTitle,
  } as const;
  const descMap = {
    tags: settings.tagsSeoDescription,
    industries: settings.industriesSeoDescription,
  } as const;

  const name = titleMap[pageType]?.trim() || fallback.name;
  const description = descMap[pageType]?.trim() || undefined;
  const ogImageUrl = (settings.ogImageUrl ?? settings.logoUrl ?? "").trim();
  const absOgImage = ogImageUrl ? ensureAbsoluteUrl(ogImageUrl, siteUrl) : undefined;

  const itemListElements = items
    .slice(0, 20)
    .map((item, i) => itemToListItem(item, fallback.path, siteUrl, i));

  const itemList: Record<string, unknown> = {
    "@type": "ItemList",
    itemListOrder: "ItemListOrderAscending",
    numberOfItems: totalCount,
    itemListElement: itemListElements,
  };

  const collectionPage: Record<string, unknown> = {
    "@type": "CollectionPage",
    "@id": `${pageUrl}#collectionpage`,
    name,
    url: pageUrl,
    ...(description && { description }),
    inLanguage: inLangCodes,
    isPartOf: { "@id": website["@id"] },
    ...(dateModified ? { dateModified: dateModified.toISOString() } : {}),
    mainEntity: itemList,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, item: { "@id": siteUrl, name: "الرئيسية" } },
        { "@type": "ListItem", position: 2, item: { "@id": pageUrl, name } },
      ],
    },
  };
  if (absOgImage) {
    collectionPage.primaryImageOfPage = {
      "@type": "ImageObject",
      url: absOgImage,
      // No width/height: nothing here measured this file. The pair was a literal 1200x630 on every
      // image — measured 25 Aug 2026 across four category images, two of them 2048x2048 squares. A
      // declared size that is not the file’s is worse than none: schema.org ImageObject width/height
      // describe the actual image, and a consumer that trusts them lays out a crop that does not
      // exist. Omitted until the row carries real dimensions — the same rule the modonty side applies
      // in withHonestOpenGraphImageDimensions.
    };
  }

  return {
    "@context": SCHEMA_CONTEXT,
    // `website` is built above but deliberately NOT in this graph. /categories, /tags and
    // /industries are list pages, and Google is explicit: "The WebSite structured data must be
    // on the home page of the site … you only need to add this markup to the home page of your
    // site" (developers.google.com/search/docs/appearance/site-names). `isPartOf` above still
    // carries its `@id` — a reference to the entity the home page defines, which is the correct
    // cross-page pattern. Removed 28 Aug 2026.
    "@graph": [org, collectionPage],
  };
}
