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

/**
 * The same "substantive" test `resolveClientPageState` applies before it returns "not-ready",
 * fed by the same three signals `generateMetadata` uses to decide noindex on the partner page
 * (description ?? seoDescription, and the published-article count). Kept as one expression so
 * the two stay readable side by side: if the page's gate moves, this moves with it.
 */
function isIndexableClient(c: {
  description: string | null;
  seoDescription: string | null;
  _count: { articles: number };
}): boolean {
  return !!(c.description || c.seoDescription)?.trim() || c._count.articles > 0;
}

/**
 * Escapes the five XML metacharacters in free text that reaches the sitemap.
 *
 * Next interpolates `videos` fields into the XML **raw** — verified in
 * `next/dist/build/webpack/loaders/metadata/resolve-route-data.js`, which emits
 * `` `<video:title>${video.title}</video:title>` `` with no escaping of its own. Google requires
 * the opposite: "All HTML entities must be escaped or wrapped in a CDATA block".
 *
 * The stake is the whole file, not the one reel: a single `&` typed into a reel title in the
 * console makes the XML malformed, and a malformed sitemap is rejected entirely — every article,
 * client and category in it stops being submitted. Reel titles and descriptions are the only
 * free text here; slugs and URLs are already safe by construction.
 */
function xmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Google's published limits for the video tags used below. */
const VIDEO_DESCRIPTION_MAX = 2048;
const VIDEO_UPLOADER_MAX = 255;
const VIDEO_DURATION_MIN = 1;
const VIDEO_DURATION_MAX = 28800;

type SitemapReel = {
  reelSlug: string | null;
  reelPublishedAt: Date | null;
  thumbnailUrl: string | null;
  title: string | null;
  description: string | null;
  bunnyVideoId: string | null;
  mp4Url: string | null;
  durationSec: number | null;
  viewsCount: number;
  client: { name: string; slug: string } | null;
};

type SitemapVideo = NonNullable<MetadataRoute.Sitemap[number]["videos"]>[number];

/**
 * The `<video:video>` block for one reel — the discovery half of what the watch page already
 * says in its `VideoObject`. Structured data is only read once Google has crawled the page;
 * the sitemap hands it the title, thumbnail and file up front, which is what shortens the gap
 * between publishing a reel and it being eligible as a video result.
 *
 * Returns `null` rather than a partial block whenever a required field is missing: Google
 * demands title + thumbnail_loc + description + one of content_loc/player_loc, and a half-formed
 * entry is an invalid entry.
 */
function reelVideoEntry(r: SitemapReel): SitemapVideo | null {
  // An image reel is not a video. Its watch page emits `ImageObject`, and a `<video:video>` here
  // would be a false claim to the crawler about a file that does not exist.
  if (!r.bunnyVideoId) return null;

  const title = r.title?.trim();
  const description = r.description?.trim();
  // `mp4Url` is the progressive file, not the HLS playlist — the same URL the page's
  // `VideoObject.contentUrl` names, and the reason the console stores it at all. It lives on
  // Bunny's host, so it can never equal the `<loc>` URL, which Google forbids.
  if (!title || !description || !r.thumbnailUrl || !r.mp4Url) return null;

  const duration =
    r.durationSec && r.durationSec >= VIDEO_DURATION_MIN && r.durationSec <= VIDEO_DURATION_MAX
      ? r.durationSec
      : undefined;

  return {
    title: xmlText(title),
    thumbnail_loc: r.thumbnailUrl,
    description: xmlText(description.slice(0, VIDEO_DESCRIPTION_MAX)),
    content_loc: r.mp4Url,
    family_friendly: "yes",
    ...(duration && { duration }),
    ...(r.reelPublishedAt && { publication_date: r.reelPublishedAt.toISOString() }),
    ...(r.viewsCount > 0 && { view_count: r.viewsCount }),
    // `info` is passed WITH `content`, never without: Next builds the tag as
    // `` `<video:uploader${uploader.info && ` info="..."`}>` ``, so an absent `info` interpolates
    // the string "undefined" and emits `<video:uploaderundefined>` — measured, not assumed.
    // The client page is on our own host, which is Google's requirement for that attribute.
    ...(r.client && {
      uploader: {
        content: xmlText(r.client.name.slice(0, VIDEO_UPLOADER_MAX)),
        info: new URL(`/clients/${r.client.slug}`, SITE_URL).href,
      },
    }),
  };
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
    // An ACTIVE subscription is not the same as a page worth indexing. A partner with no
    // description and no published article renders the "قيد التجهيز" panel and serves
    // noindex (see `resolveClientPageState` — clients/[slug]/page.tsx). Listing those in the
    // sitemap tells Google "crawl this" while the page itself says "don't index this" —
    // Google: "Don't include URLs in your sitemap that are blocked from indexing."
    // Measured 25 Aug 2026: 4 of 35 active partners were in this state.
    db.client
      .findMany({
        where: { subscriptionStatus: SubscriptionStatus.ACTIVE },
        select: {
          slug: true,
          updatedAt: true,
          description: true,
          seoDescription: true,
          _count: { select: { articles: { where: { status: ArticleStatus.PUBLISHED } } } },
        },
      })
      .then((rows) => rows.filter(notTestSlug).filter(isIndexableClient)),
    db.author.findMany({ select: { slug: true, updatedAt: true } }).then((rows) => rows.filter(notTestSlug)),
    db.tag.findMany({ select: { slug: true, updatedAt: true } }).then((rows) => rows.filter(notTestSlug)),
    db.industry.findMany({ select: { slug: true, updatedAt: true } }).then((rows) => rows.filter(notTestSlug)),
    // Published reels carry a standalone, indexable watch page each. Only rows with a slug
    // are listed — a reel without one has no URL to point at. (The feed at /reels was noindex
    // while it had no content; it is indexable since 25 Aug 2026 — card 83c.)
    db.media.findMany({
      where: { inReels: true, reelStatus: "PUBLISHED", reelSlug: { not: null }, client: { isNot: null } },
      select: {
        reelSlug: true,
        reelPublishedAt: true,
        thumbnailUrl: true,
        // Everything below feeds `<video:video>` — see `reelVideoEntry`. `bunnyVideoId` is the
        // video/image discriminator, exactly as `getReelBySlug` uses it.
        title: true,
        description: true,
        bunnyVideoId: true,
        mp4Url: true,
        durationSec: true,
        viewsCount: true,
        client: { select: { name: true, slug: true } },
      },
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
    .map((r) => {
      const video = reelVideoEntry(r);
      return {
        url: new URL(`/reels/${r.reelSlug}`, baseUrl).href,
        lastModified: r.reelPublishedAt || undefined,
        ...(r.thumbnailUrl && { images: [r.thumbnailUrl] }),
        ...(video && { videos: [video] }),
      };
    });

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
    { url: new URL("/modonty", baseUrl).href, lastModified: lastArticleModified },
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
    { url: new URL("/story", baseUrl).href },
    { url: new URL("/team", baseUrl).href },
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
    // /news/subscribe excluded — form-only page, no value in search.
    // /search excluded — its metadata is noindex,nofollow.
    // /page/[n] excluded — crawlable pagination links already expose the feed sequence.
    // Partner subpages are conditional child views; each live partner root links to the ones it serves.
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
