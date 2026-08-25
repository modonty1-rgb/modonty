// Build trigger: 2026-05-27 v0.63.4 cache rebuild
import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { ArticleStatus, SubscriptionStatus } from "@prisma/client";
import { SITE_URL } from "@/constants";

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
  featuredImage: { url: string; bunnyUrl: string | null; blurDataURL: string | null } | null;
};

type EntityWithUpdatedAt = { slug: string; updatedAt: Date };

function maxDate(dates: Array<Date | null | undefined>): Date | undefined {
  const valid = dates.filter((d): d is Date => d instanceof Date);
  if (valid.length === 0) return undefined;
  return new Date(Math.max(...valid.map((d) => d.getTime())));
}

/**
 * Fixture slugs, kept out of the sitemap: development leftovers pollute Google's view of the
 * site and spend crawl budget on pages nobody should reach.
 *
 * The rule used to be `endsWith("-test")` alone, and it was applied to five entity types out
 * of seven. Both halves were wrong, and the second one hid the first: the fixtures actually
 * measured in the sitemap on 24 Aug 2026 were `reel-test-mt1ci48p-1`, `dev-modonty-reel-1`
 * and friends — none of which END in `-test`, so widening the reach without widening the
 * pattern would have changed nothing.
 *
 * Every shape here is ASCII with an English prefix. Real content slugs on this site are
 * Arabic, so the false-positive risk is a slug someone deliberately names in English with one
 * of these prefixes — and the fix for that is to rename it, as it always was.
 *
 * This is still a naming convention, not a flag on the row. A real `isFixture` column would
 * be sturdier and is worth doing the day fixtures start being created by anything other than
 * a developer typing a name.
 */
const FIXTURE_SLUG = /(^|-)(test|dev|demo|e2e|sample|dummy)(-|$)/i;

function isFixtureSlug(slug: string | null | undefined): boolean {
  return !!slug && FIXTURE_SLUG.test(slug);
}

function notTestSlug<T extends { slug: string }>(e: T): boolean {
  return !isFixtureSlug(e.slug);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  const [articles, categories, clients, authors, tags, industries, reels] = await Promise.all([
    db.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
      },
      select: {
        slug: true,
        datePublished: true,
        dateModified: true,
        featuredImage: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
      },
      orderBy: { datePublished: "desc" },
      // Articles were the one type the fixture filter never reached, on the biggest set of
      // URLs in the file.
    }).then((rows) => rows.filter(notTestSlug)),
    db.category.findMany({ select: { slug: true, updatedAt: true } }).then((rows) => rows.filter(notTestSlug)),
    db.client.findMany({ where: { subscriptionStatus: SubscriptionStatus.ACTIVE }, select: { slug: true, updatedAt: true } }).then((rows) => rows.filter(notTestSlug)),
    db.author.findMany({ select: { slug: true, updatedAt: true } }).then((rows) => rows.filter(notTestSlug)),
    db.tag.findMany({ select: { slug: true, updatedAt: true } }).then((rows) => rows.filter(notTestSlug)),
    db.industry.findMany({ select: { slug: true, updatedAt: true } }).then((rows) => rows.filter(notTestSlug)),
    // Published reels carry a standalone, indexable watch page each. Only rows with a slug
    // are listed — a reel without one has no URL to point at. (The feed at /reels was noindex
    // while it had no content; it is indexable since 25 Aug 2026 — card 83c.)
    db.media.findMany({
      where: { inReels: true, reelStatus: "PUBLISHED", reelSlug: { not: null }, client: { isNot: null } },
      select: { reelSlug: true, reelPublishedAt: true, thumbnailUrl: true },
      orderBy: { reelPublishedAt: "desc" },
      // A reel's public key is `reelSlug`, so it cannot use `notTestSlug` as written.
    }).then((rows) => rows.filter((r) => !isFixtureSlug(r.reelSlug))),
  ]);

  // ── DYNAMIC ENTITY URLS (lastmod from real DB timestamps) ────────────
  const articleUrls: MetadataRoute.Sitemap = (articles as SitemapArticle[]).map((article) => ({
    url: new URL(`/articles/${article.slug}`, baseUrl).href,
    lastModified: article.dateModified || article.datePublished || undefined,
    ...(mediaSrc(article.featuredImage) && { images: [mediaSrc(article.featuredImage) ?? article.featuredImage!.url] }),
  }));

  const reelUrls: MetadataRoute.Sitemap = reels
    .filter((r): r is typeof r & { reelSlug: string } => Boolean(r.reelSlug))
    .map((r) => ({
      url: new URL(`/reels/${r.reelSlug}`, baseUrl).href,
      lastModified: r.reelPublishedAt || undefined,
      ...(r.thumbnailUrl && { images: [r.thumbnailUrl] }),
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
    // The article archive. Only the unfiltered view is listed: every `?category=`/`?tag=`
    // combination is reachable from its rail and carries its own canonical, so listing them
    // here would flood the sitemap with URLs that differ only by a query string.
    { url: new URL("/articles", baseUrl).href, lastModified: lastArticleModified },
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
    // Section landing pages. Each is linked from the top nav or a homepage rail, so Google meets
    // them while crawling anyway — but a page reachable only by crawl is discovered late and
    // recrawled rarely. Listing them here is how they get treated as first-class destinations.
    { url: new URL("/reels", baseUrl).href },
    { url: new URL("/audio", baseUrl).href },
    { url: new URL("/trust", baseUrl).href },
    { url: new URL("/booking", baseUrl).href },
    { url: new URL("/shop", baseUrl).href },
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
    ...reelUrls,
    ...categoryUrls,
    ...clientUrls,
    ...tagUrls,
    ...industryUrls,
  ];
}
