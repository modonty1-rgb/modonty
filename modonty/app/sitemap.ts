import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

/**
 * Main sitemap (Google's primary trust signal).
 *
 * Best-practice rules from Google Search Central (2026) applied here:
 *   1. `lastmod` only when "consistently and verifiably accurate"
 *      → Real DB timestamps for articles/categories/clients/tags/authors/industries.
 *      → Computed MAX(child.updatedAt) for listing pages.
 *      → OMITTED entirely for static code-only pages (about/terms/legal/help/...).
 *   2. `priority` + `changefreq` → never included (Google officially ignores).
 *   3. Image data → only featuredImage:loc here (separate /image-sitemap.xml
 *      handles full image discovery per Google's "separate or combined — equally fine").
 *   4. Absolute URLs only, percent-encoded via URL constructor.
 *   5. Only canonical URLs (PUBLISHED articles, current entities).
 */

type SitemapArticle = {
  slug: string;
  datePublished: Date | null;
  dateModified: Date | null;
  featuredImage: { url: string } | null;
};

type EntityWithUpdatedAt = { slug: string; updatedAt: Date };

function maxDate(dates: Array<Date | null | undefined>): Date | undefined {
  const valid = dates.filter((d): d is Date => d instanceof Date);
  if (valid.length === 0) return undefined;
  return new Date(Math.max(...valid.map((d) => d.getTime())));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";

  const [articles, categories, clients, authors, tags, industries] = await Promise.all([
    db.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
      },
      select: {
        slug: true,
        datePublished: true,
        dateModified: true,
        featuredImage: { select: { url: true } },
      },
      orderBy: { datePublished: "desc" },
    }),
    db.category.findMany({ select: { slug: true, updatedAt: true } }),
    db.client.findMany({ select: { slug: true, updatedAt: true } }),
    db.author.findMany({ select: { slug: true, updatedAt: true } }),
    db.tag.findMany({ select: { slug: true, updatedAt: true } }),
    db.industry.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  // ── DYNAMIC ENTITY URLS (lastmod from real DB timestamps) ────────────
  const articleUrls: MetadataRoute.Sitemap = (articles as SitemapArticle[]).map((article) => ({
    url: new URL(`/articles/${article.slug}`, baseUrl).href,
    lastModified: article.dateModified || article.datePublished || undefined,
    ...(article.featuredImage?.url && { images: [article.featuredImage.url] }),
  }));

  const categoryUrls: MetadataRoute.Sitemap = (categories as EntityWithUpdatedAt[]).map((c) => ({
    url: new URL(`/categories/${c.slug}`, baseUrl).href,
    lastModified: c.updatedAt,
  }));

  const clientUrls: MetadataRoute.Sitemap = (clients as EntityWithUpdatedAt[]).map((c) => ({
    url: new URL(`/clients/${c.slug}`, baseUrl).href,
    lastModified: c.updatedAt,
  }));

  const authorUrls: MetadataRoute.Sitemap = (authors as EntityWithUpdatedAt[]).map((a) => ({
    url: new URL(`/authors/${a.slug}`, baseUrl).href,
    lastModified: a.updatedAt,
  }));

  const tagUrls: MetadataRoute.Sitemap = (tags as EntityWithUpdatedAt[]).map((t) => ({
    url: new URL(`/tags/${t.slug}`, baseUrl).href,
    lastModified: t.updatedAt,
  }));

  const industryUrls: MetadataRoute.Sitemap = (industries as EntityWithUpdatedAt[]).map((i) => ({
    url: new URL(`/industries/${i.slug}`, baseUrl).href,
    lastModified: i.updatedAt,
  }));

  // ── LISTING/INDEX PAGES (lastmod = max of children's updatedAt) ──────
  // Reflects when each listing's content actually changed last.
  const lastArticleModified =
    maxDate((articles as SitemapArticle[]).map((a) => a.dateModified || a.datePublished)) ?? undefined;
  const lastCategoryModified = maxDate((categories as EntityWithUpdatedAt[]).map((c) => c.updatedAt));
  const lastClientModified = maxDate((clients as EntityWithUpdatedAt[]).map((c) => c.updatedAt));
  const lastTagModified = maxDate((tags as EntityWithUpdatedAt[]).map((t) => t.updatedAt));
  const lastIndustryModified = maxDate((industries as EntityWithUpdatedAt[]).map((i) => i.updatedAt));

  const listingUrls: MetadataRoute.Sitemap = [
    // Homepage — most-recent article touches it (latest feed/trending shown)
    { url: baseUrl, lastModified: lastArticleModified },
    { url: new URL("/trending", baseUrl).href, lastModified: lastArticleModified },
    { url: new URL("/categories", baseUrl).href, lastModified: lastCategoryModified },
    { url: new URL("/clients", baseUrl).href, lastModified: lastClientModified },
    { url: new URL("/tags", baseUrl).href, lastModified: lastTagModified },
    { url: new URL("/industries", baseUrl).href, lastModified: lastIndustryModified },
  ];

  // ── STATIC PAGES (no lastmod — Google trusts sitemap more when honest) ─
  // Per Google: "Use lastmod only if it's consistently and verifiably accurate."
  // These are code-only pages; their actual modification date lives in git, not DB.
  // Omitting lastmod is the explicit official-recommended approach for this case.
  const staticPages: MetadataRoute.Sitemap = [
    { url: new URL("/about", baseUrl).href },
    { url: new URL("/contact", baseUrl).href },
    { url: new URL("/news", baseUrl).href },
    { url: new URL("/legal", baseUrl).href },
    { url: new URL("/legal/user-agreement", baseUrl).href },
    { url: new URL("/legal/privacy-policy", baseUrl).href },
    { url: new URL("/legal/cookie-policy", baseUrl).href },
    { url: new URL("/legal/copyright-policy", baseUrl).href },
    { url: new URL("/terms", baseUrl).href },
    { url: new URL("/help", baseUrl).href },
    { url: new URL("/help/faq", baseUrl).href },
    { url: new URL("/help/feedback", baseUrl).href },
    // /news/subscribe excluded — form-only page, no value in search.
  ];

  return [
    ...listingUrls,
    ...authorUrls,
    ...staticPages,
    ...articleUrls,
    ...categoryUrls,
    ...clientUrls,
    ...tagUrls,
    ...industryUrls,
  ];
}
