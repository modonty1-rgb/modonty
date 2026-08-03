/**
 * Build Tags / Industries page @graph JSON-LD from Settings + the taxonomy rows.
 *
 * Same shape as the Categories page builder (Organization + WebSite + CollectionPage with an
 * ItemList of Thing nodes) — tags and industries are flat taxonomies, so they need no `broader`.
 * Written so every modonty listing page goes through one validated generator instead of the thin
 * CollectionPage builder the listing generator used to fall back to.
 */

import type { SettingsForHomeJsonLd } from "./build-home-jsonld-from-settings";
import { buildSiteOrgAndWebSite } from "./build-clients-page-jsonld";

function ensureAbsoluteUrl(url: string | null | undefined, siteUrl: string): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u.replace("http://", "https://");
  if (u.startsWith("/")) return `${siteUrl}${u}`;
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
  const profileUrl = `${siteUrl}${basePath}/${item.slug}`;
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
      width: 1200,
      height: 630,
      ...(item.socialImageAlt?.trim() && { caption: item.socialImageAlt.trim() }),
    };
  }
  if (item.id) thing.identifier = item.id;

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
  dateModified: Date
): object {
  const siteUrl = (settings.siteUrl?.trim() || "https://www.modonty.com").replace(/\/$/, "");
  const fallback = TAXONOMY_FALLBACKS[pageType];
  const pageUrl = `${siteUrl}${fallback.path}`;
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
  const description = descMap[pageType]?.trim() || fallback.description;
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
    description,
    inLanguage: inLangCodes,
    isPartOf: { "@id": `${siteUrl}/#website` },
    dateModified: dateModified.toISOString(),
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
      width: 1200,
      height: 630,
    };
  }

  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [org, website, collectionPage],
  };
}
