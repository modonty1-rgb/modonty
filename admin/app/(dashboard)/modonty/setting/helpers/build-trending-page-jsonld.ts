/**
 * Build Trending page @graph JSON-LD from Settings + articles.
 * Spec: importatn-TRENDING-PAGE-META-JSONLD-SPEC.md §4, §4a
 */

import { absoluteUrl, entityUrl } from "@modonty/shared/lib/seo/absolute-url";
import { buildListAuthorNode } from "@/lib/seo/build-list-author-node";
import { requireSiteUrl } from "@modonty/shared/lib/seo/require-site-url";
import type { SettingsForHomeJsonLd } from "./build-home-jsonld-from-settings";
import type { ArticleForHomeJsonLd } from "./build-home-jsonld-from-settings";
import { buildSiteOrgAndWebSite } from "./build-clients-page-jsonld";
import { mediaSrc } from "@modonty/shared/lib/media-src";

function ensureAbsoluteUrl(url: string | null | undefined, siteUrl: string): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u.replace("http://", "https://");
  if (u.startsWith("/")) return absoluteUrl(u, siteUrl);
  return `https://${u}`;
}

const SCHEMA_CONTEXT = "https://schema.org";

function articleToListItem(article: ArticleForHomeJsonLd, siteUrl: string, index: number): Record<string, unknown> {
  const articleUrl = entityUrl("articles", article.slug, siteUrl);
  const clientUrl = entityUrl("clients", article.client.slug, siteUrl);
  const authorUrl = article.author.slug ? entityUrl("authors", article.author.slug, siteUrl) : undefined;
  const imageUrl = mediaSrc(article.featuredImage)?.trim();
  const absImage = imageUrl ? ensureAbsoluteUrl(imageUrl, siteUrl) : undefined;
  const clientLogo = mediaSrc(article.client.logoMedia)?.trim();
  const absClientLogo = clientLogo ? ensureAbsoluteUrl(clientLogo, siteUrl) : undefined;

  const articleNode: Record<string, unknown> = {
    "@type": "Article",
    "@id": articleUrl,
    name: article.title,
    headline: article.title,
    description: (article.excerpt ?? "").trim() || undefined,
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    datePublished:
      article.datePublished instanceof Date
        ? article.datePublished.toISOString()
        : typeof article.datePublished === "string"
          ? article.datePublished
          : undefined,
    ...(article.dateModified && {
      dateModified:
        article.dateModified instanceof Date
          ? article.dateModified.toISOString()
          : String(article.dateModified),
    }),
    author: buildListAuthorNode(article.author, siteUrl),
    publisher: {
      "@type": "Organization",
      name: article.client.name,
      url: clientUrl,
      ...(absClientLogo && { logo: absClientLogo }),
    },
    ...(article.category?.name && { articleSection: article.category.name }),
    ...(article.tags?.length && {
      keywords: article.tags.map((t) => t.name).join(", "),
    }),
    ...(article.wordCount != null && { wordCount: article.wordCount }),
    ...(article.inLanguage && { inLanguage: article.inLanguage }),
    ...(absImage && {
      image: {
        "@type": "ImageObject",
        url: absImage,
        // No width/height: nothing here measured this file. ArticleForHomeJsonLd.featuredImage
        // carries url/bunnyUrl/blurDataURL only — no dimensions — so the pair was a literal
        // 1200x630 on every article image whatever its real size.
      },
    }),
  };
  return {
    "@type": "ListItem",
    position: index + 1,
    item: articleNode,
  };
}

export function buildTrendingPageJsonLd(
  settings: SettingsForHomeJsonLd,
  articles: ArticleForHomeJsonLd[],
  totalCount: number,
  // `null` when the list is empty. An empty listing page has no content date, and the
  // caller used to pass `new Date()` for it — a page announcing it changed today because it
  // has nothing on it. Absent stays absent, the same rule the per-item dates below follow.
  dateModified: Date | null
): object {
  const siteUrl = requireSiteUrl(settings.siteUrl).replace(/\/$/, "");
  const pageUrl = absoluteUrl("/trending", siteUrl);
  const { org, website, inLangCodes } = buildSiteOrgAndWebSite(settings, siteUrl);

  const name = settings.trendingSeoTitle?.trim() || "الأكثر رواجاً";
  const description =
    settings.trendingSeoDescription?.trim() || undefined;
  const ogImageUrl = (settings.ogImageUrl ?? settings.logoUrl ?? "").trim();
  const absOgImage = ogImageUrl ? ensureAbsoluteUrl(ogImageUrl, siteUrl) : undefined;

  const itemListElements = articles.slice(0, 20).map((a, i) => articleToListItem(a, siteUrl, i));

  const itemList: Record<string, unknown> = {
    "@type": "ItemList",
    itemListOrder: "ItemListOrderDescending",
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
      // No width/height: this is settings.ogImageUrl/logoUrl, a bare url with no Media row
      // behind it. Measured 27 Aug 2026 on production, the declared 1200x630 described a
      // 5000x2625 PNG.
    };
  }

  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [org, website, collectionPage],
  };
}
