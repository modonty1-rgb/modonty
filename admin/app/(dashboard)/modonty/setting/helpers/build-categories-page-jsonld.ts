/**
 * Build Categories page @graph JSON-LD from Settings + categories.
 * Spec: importatn-CATEGORIES-PAGE-META-JSONLD-SPEC.md §4, §4a
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

export interface CategoryForCategoriesPageJsonLd {
  name: string;
  slug: string;
  description?: string | null;
  seoDescription?: string | null;
  seoTitle?: string | null;
  socialImage?: string | null;
  socialImageAlt?: string | null;
  canonicalUrl?: string | null;
  parentId?: string | null;
  parent?: { slug: string } | null;
  id?: string | null;
  updatedAt?: Date | string | null;
}

function categoryToThing(
  category: CategoryForCategoriesPageJsonLd,
  siteUrl: string,
  index: number
): Record<string, unknown> {
  const profileUrl = `${siteUrl}/categories/${category.slug}`;
  const url = category.canonicalUrl?.trim() || profileUrl;
  const absUrl = ensureAbsoluteUrl(url, siteUrl) || profileUrl;
  const absImage = category.socialImage ? ensureAbsoluteUrl(category.socialImage, siteUrl) : undefined;

  const thing: Record<string, unknown> = {
    "@type": "Thing",
    "@id": profileUrl,
    name: category.name,
    url: absUrl,
    mainEntityOfPage: profileUrl,
  };

  const desc = (category.description ?? category.seoDescription)?.trim();
  if (desc) thing.description = desc;
  if (category.seoTitle?.trim() && category.seoTitle !== category.name) {
    thing.alternateName = category.seoTitle.trim();
  }
  if (absImage) {
    thing.image = {
      "@type": "ImageObject",
      url: absImage,
      width: 1200,
      height: 630,
      ...(category.socialImageAlt?.trim() && { caption: category.socialImageAlt.trim() }),
    };
  }
  if (category.parent?.slug) {
    thing.broader = { "@id": `${siteUrl}/categories/${category.parent.slug}` };
  }
  if (category.id) thing.identifier = category.id;

  return {
    "@type": "ListItem",
    position: index + 1,
    item: thing,
  };
}

export function buildCategoriesPageJsonLd(
  settings: SettingsForHomeJsonLd,
  categories: CategoryForCategoriesPageJsonLd[],
  totalCount: number,
  dateModified: Date
): object {
  const siteUrl = (settings.siteUrl?.trim() || "https://modonty.com").replace(/\/$/, "");
  const pageUrl = `${siteUrl}/categories`;
  const { org, website, inLangCodes } = buildSiteOrgAndWebSite(settings, siteUrl);

  const name = settings.categoriesSeoTitle?.trim() || "الفئات";
  const description =
    settings.categoriesSeoDescription?.trim() || "استكشف المقالات حسب الفئة - تصفح جميع فئات المحتوى المتاحة.";
  const ogImageUrl = (settings.ogImageUrl ?? settings.logoUrl ?? "").trim();
  const absOgImage = ogImageUrl ? ensureAbsoluteUrl(ogImageUrl, siteUrl) : undefined;

  const itemListElements = categories.slice(0, 20).map((c, i) => categoryToThing(c, siteUrl, i));

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
