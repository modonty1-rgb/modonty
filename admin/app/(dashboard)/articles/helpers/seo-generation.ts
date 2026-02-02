/**
 * SEO metadata generation utilities
 * Functions for generating SEO titles, descriptions, and URLs
 */

/**
 * Generate SEO title with optional client name
 */
export function generateSEOTitle(title: string, clientName?: string): string {
  if (!title) return "";
  if (clientName) {
    return `${title} | ${clientName}`;
  }
  return title;
}

/**
 * Generate SEO description from excerpt
 * Truncates to maxLength if needed
 */
export function generateSEODescription(
  excerpt: string,
  maxLength: number = 155
): string {
  if (!excerpt) return "";
  const stripped = excerpt.replace(/<[^>]*>/g, "").trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength - 3) + "...";
}

/**
 * Generate canonical URL for article. Always siteUrl/articles/{slug} (no /clients/ in path).
 */
export function generateCanonicalUrl(
  slug: string,
  baseUrl?: string,
  _clientSlug?: string
): string {
  const siteUrl = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
  return `${siteUrl}/articles/${slug}`;
}

/** Normalize stored canonical for form: reject /clients/.../articles/ and use siteUrl/articles/slug. */
export function normalizeArticleCanonicalForForm(
  canonicalUrl: string | null | undefined,
  slug: string
): string | undefined {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
  if (!canonicalUrl?.trim()) return undefined;
  if (canonicalUrl.includes("/clients/")) return `${siteUrl}/articles/${slug}`;
  return canonicalUrl.trim();
}
