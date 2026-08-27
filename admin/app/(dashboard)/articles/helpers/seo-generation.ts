/**
 * SEO metadata generation utilities
 * Functions for generating SEO titles, descriptions, and URLs
 */

import { entityUrl } from "@modonty/shared/lib/seo/absolute-url";
import { truncateAtWordBoundary } from "@modonty/shared/lib/seo/truncate-at-word-boundary";

/**
 * Generate SEO title with optional client name
 */
export function generateSEOTitle(title: string, clientName?: string): string {
  if (!title) return "";
  if (clientName) {
    const full = `${title} | ${clientName}`;
    if (full.length <= 60) return full;
    const suffix = ` | ${clientName}`;
    const maxTitleLen = 60 - suffix.length;
    if (maxTitleLen > 10) {
      // No ellipsis here: the client name already follows, so the title just stops.
      const clean = truncateAtWordBoundary(title, maxTitleLen, "");
      return `${clean.trim()} | ${clientName}`;
    }
  }
  return truncateAtWordBoundary(title, 60, "").trim();
}

/**
 * Generate SEO description from excerpt
 * Truncates to maxLength if needed — always at a word boundary.
 *
 * `maxLength` is a house limit for how much of a snippet we are willing to bake, NOT a
 * Google rule: Google states there is no meta-description length limit and rewrites the
 * snippet per query anyway.
 * https://developers.google.com/search/docs/appearance/snippet
 * «there's no limit on how long a meta description can be»
 */
export function generateSEODescription(
  excerpt: string,
  maxLength: number = 155
): string {
  if (!excerpt) return "";
  const stripped = excerpt.replace(/<[^>]*>/g, "").trim();
  return truncateAtWordBoundary(stripped, maxLength);
}

/**
 * Generate canonical URL for article. Always siteUrl/articles/{slug} (no /clients/ in path).
 *
 * `baseUrl` is REQUIRED and comes from Settings.siteUrl — server callers via `loadSiteUrl()`
 * (lib/seo/site-url), the form via the `siteUrl` the server parent already passes into the
 * article form context. The old chain ended in a literal host, and this value is written
 * straight into the article's `canonicalUrl` column: a guessed host became the canonical of a
 * published article with nothing on screen saying so.
 */
export function generateCanonicalUrl(
  slug: string,
  baseUrl: string,
  _clientSlug?: string
): string {
  return new URL(`/articles/${slug}`, baseUrl).href;
}

/**
 * Normalize stored canonical for form: reject /clients/.../articles/ and use siteUrl/articles/slug.
 * `siteUrl` is required for the same reason as above.
 */
export function normalizeArticleCanonicalForForm(
  canonicalUrl: string | null | undefined,
  slug: string,
  siteUrl: string
): string | undefined {
  if (!canonicalUrl?.trim()) return undefined;
  if (canonicalUrl.includes("/clients/")) return entityUrl("articles", slug, siteUrl);
  return canonicalUrl.trim();
}
