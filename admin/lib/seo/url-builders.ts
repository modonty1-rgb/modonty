import "server-only";
import { absoluteUrl, entityUrl } from "@modonty/shared/lib/seo/absolute-url";

import { loadSiteUrl } from "./site-url";

/**
 * Centralized URL builders for the public Modonty site.
 *
 * Source of truth: `Settings.siteUrl` (DB) via `loadSiteUrl()`.
 *
 * Why centralized:
 *  - Single place that knows the URL pattern for each entity.
 *  - Impossible to hardcode `https://modonty.com` or forget `www`.
 *  - One DB hit per call — for multi-URL flows, use *FromBase variants.
 *
 * Naming convention:
 *  - `build*Url(slug)`           — async, fetches `Settings.siteUrl` once
 *  - `build*UrlFromBase(slug, baseUrl)` — sync, when caller already has baseUrl
 */

// ─────────────────────────────────────────────────────────────────
// Path constants — single source of truth for URL patterns
// ─────────────────────────────────────────────────────────────────

const PATHS = {
  articles: "/articles",
  clients: "/clients",
  categories: "/categories",
  tags: "/tags",
  industries: "/industries",
  authors: "/authors",
  sitemap: "/sitemap.xml",
  imageSitemap: "/image-sitemap.xml",
  robots: "/robots.txt",
} as const;

// ─────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────

// URL assembly itself lives in one place for the whole monorepo — see
// `@modonty/shared/lib/seo/absolute-url`. It percent-encodes the Arabic slug and swallows a
// trailing slash on the base, which the string joins that used to be here did neither of.

// ─────────────────────────────────────────────────────────────────
// Async builders — default, fetches Settings.siteUrl from DB
// ─────────────────────────────────────────────────────────────────

/** Article public URL: {siteUrl}/articles/{slug} */
export async function buildArticleUrl(slug: string): Promise<string> {
  const base = await loadSiteUrl();
  return buildArticleUrlFromBase(slug, base);
}

/** Sitemap URL: {siteUrl}/sitemap.xml */
export async function buildSitemapUrl(): Promise<string> {
  const base = await loadSiteUrl();
  return buildSitemapUrlFromBase(base);
}

/** Robots.txt URL: {siteUrl}/robots.txt */
export async function buildRobotsUrl(): Promise<string> {
  const base = await loadSiteUrl();
  return buildRobotsUrlFromBase(base);
}

// ─────────────────────────────────────────────────────────────────
// Sync builders — use when caller already has baseUrl loaded
// (avoids extra DB hit in tight loops or batched operations)
// ─────────────────────────────────────────────────────────────────

export function buildArticleUrlFromBase(slug: string, baseUrl: string): string {
  return entityUrl(PATHS.articles, slug, baseUrl);
}

/**
 * The address an article is actually served from.
 *
 * For a piece written for a client's own website that is THEIR domain, and their base
 * already carries its own path — so `/articles` is not appended. Every check that
 * compares an article against "its own URL" (canonical, og:url, JSON-LD) must be given
 * this, or it will measure the article against a site it does not live on.
 */
export function buildArticleUrlForArticle(
  article: { slug: string; isClientSiteArticle?: boolean | null; client?: { articlesBaseUrl?: string | null } | null },
  modontyBaseUrl: string,
): string {
  const clientBase = (article.client?.articlesBaseUrl ?? "").trim();
  if (article.isClientSiteArticle && clientBase) {
    // The partner's base may carry its own path (`https://x.com/blog`) — `absoluteUrl` appends
    // to it instead of replacing it, which is why this is not `new URL(path, base)`.
    return absoluteUrl(`/${article.slug}`, clientBase);
  }
  return buildArticleUrlFromBase(article.slug, modontyBaseUrl);
}

export function buildSitemapUrlFromBase(baseUrl: string): string {
  return absoluteUrl(PATHS.sitemap, baseUrl);
}

function buildRobotsUrlFromBase(baseUrl: string): string {
  return absoluteUrl(PATHS.robots, baseUrl);
}
