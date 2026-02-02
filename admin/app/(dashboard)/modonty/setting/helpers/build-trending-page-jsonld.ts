/**
 * Build Trending page @graph JSON-LD from Settings + articles.
 * Spec: importatn-TRENDING-PAGE-META-JSONLD-SPEC.md §4, §4a
 */

import type { SettingsForHomeJsonLd } from "./build-home-jsonld-from-settings";
import type { ArticleForHomeJsonLd } from "./build-home-jsonld-from-settings";
import { buildSiteOrgAndWebSite } from "./build-clients-page-jsonld";

function ensureAbsoluteUrl(url: string | null | undefined, siteUrl: string): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u.replace("http://", "https://");
  if (u.startsWith("/")) return `${siteUrl}${u}`;
  return `https://${u}`;
}

const SCHEMA_CONTEXT = "https://schema.org";

function articleToListItem(article: ArticleForHomeJsonLd, siteUrl: string, index: number): Record<string, unknown> {
  const articleUrl = `${siteUrl}/articles/${article.slug}`;
  const clientUrl = `${siteUrl}/clients/${article.client.slug}`;
  const authorUrl = article.author.slug ? `${siteUrl}/authors/${article.author.slug}` : undefined;
  const imageUrl = article.featuredImage?.url?.trim();
  const absImage = imageUrl ? ensureAbsoluteUrl(imageUrl, siteUrl) : undefined;
  const clientLogo = article.client.logoMedia?.url?.trim();
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
    author: {
      "@type": "Person",
      name: article.author.name || "Modonty",
      ...(authorUrl && { url: authorUrl }),
    },
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
        width: 1200,
        height: 630,
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
  dateModified: Date
): object {
  const siteUrl = (settings.siteUrl?.trim() || "https://modonty.com").replace(/\/$/, "");
  const pageUrl = `${siteUrl}/trending`;
  const { org, website, inLangCodes } = buildSiteOrgAndWebSite(settings, siteUrl);

  const name = settings.trendingSeoTitle?.trim() || "الأكثر رواجاً";
  const description =
    settings.trendingSeoDescription?.trim() || "استكشف المقالات الأكثر رواجاً - محتوى يتابعه القراء الآن.";
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
