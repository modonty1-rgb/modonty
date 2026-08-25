/**
 * Build the article archive (/articles) @graph JSON-LD from Settings + the newest articles.
 *
 * The archive is the site's core listing and was the ONLY one without a cached card: it
 * shipped four hand-rolled OpenGraph fields and no JSON-LD at all. It now follows the exact
 * pattern of its sisters — Organization + WebSite + CollectionPage(ItemList) — so one
 * generator, one validator, and one stored blob serve it like every other listing page.
 *
 * The blob describes the BARE `/articles`. Filtered views (?category=…&page=2) derive their
 * own canonical at request time on modonty's side; their content is the same archive.
 */

import { buildSiteOrgAndWebSite } from "./build-clients-page-jsonld";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { buildSiteEntityIds } from "@modonty/shared/lib/seo/site-entity-ids";

import type { ArticleForHomeJsonLd, SettingsForHomeJsonLd } from "./build-home-jsonld-from-settings";

const SCHEMA_CONTEXT = "https://schema.org";

function ensureAbsoluteUrl(url: string | null | undefined, siteUrl: string): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u.replace("http://", "https://");
  if (u.startsWith("/")) return `${siteUrl}${u}`;
  return `https://${u}`;
}

function articleToListItem(article: ArticleForHomeJsonLd, siteUrl: string, index: number): Record<string, unknown> {
  const articleUrl = `${siteUrl}/articles/${article.slug}`;
  const imageUrl = mediaSrc(article.featuredImage)?.trim();
  const absImage = imageUrl ? ensureAbsoluteUrl(imageUrl, siteUrl) : undefined;

  const articleNode: Record<string, unknown> = {
    "@type": "Article",
    "@id": articleUrl,
    name: article.title,
    headline: article.title,
    description: (article.excerpt ?? "").trim() || undefined,
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    datePublished:
      article.datePublished instanceof Date ? article.datePublished.toISOString() : article.datePublished ?? undefined,
    dateModified:
      article.dateModified instanceof Date ? article.dateModified.toISOString() : article.dateModified ?? undefined,
    inLanguage: article.inLanguage,
    author: { "@type": "Person", name: article.author.name },
    publisher: { "@id": buildSiteEntityIds(siteUrl).organization },
  };
  // A size is declared only where one was measured — never 1200×630 over an untouched original.
  if (absImage) articleNode.image = { "@type": "ImageObject", url: absImage };
  if (article.category?.name) articleNode.articleSection = article.category.name;

  for (const k of Object.keys(articleNode)) if (articleNode[k] === undefined) delete articleNode[k];

  return { "@type": "ListItem", position: index + 1, item: articleNode };
}

export function buildArticlesPageJsonLd(
  settings: SettingsForHomeJsonLd & { articlesSeoTitle?: string | null; articlesSeoDescription?: string | null },
  articles: ArticleForHomeJsonLd[],
  totalCount: number,
  dateModified: Date,
): object {
  const siteUrl = (settings.siteUrl?.trim() || "https://www.modonty.com").replace(/\/$/, "");
  const pageUrl = `${siteUrl}/articles`;
  const { org, website, inLangCodes } = buildSiteOrgAndWebSite(settings, siteUrl);

  const name = settings.articlesSeoTitle?.trim() || "كل المقالات";
  const description =
    settings.articlesSeoDescription?.trim() ||
    "كل مقالات مدونتي في مكان واحد — صفِّ بالمجال أو التصنيف، واختر حسب الوقت اللي عندك.";
  const ogImageUrl = (settings.ogImageUrl ?? settings.logoUrl ?? "").trim();
  const absOgImage = ogImageUrl ? ensureAbsoluteUrl(ogImageUrl, siteUrl) : undefined;

  const itemList: Record<string, unknown> = {
    "@type": "ItemList",
    itemListOrder: "ItemListOrderDescending",
    numberOfItems: totalCount,
    itemListElement: articles.slice(0, 20).map((a, i) => articleToListItem(a, siteUrl, i)),
  };

  const collectionPage: Record<string, unknown> = {
    "@type": "CollectionPage",
    "@id": `${pageUrl}#collectionpage`,
    name,
    url: pageUrl,
    description,
    inLanguage: inLangCodes,
    isPartOf: { "@id": website["@id"] },
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
    collectionPage.primaryImageOfPage = { "@type": "ImageObject", url: absOgImage };
  }

  return { "@context": SCHEMA_CONTEXT, "@graph": [org, website, collectionPage] };
}
