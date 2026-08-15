/**
 * The hreflang map, from `Settings.defaultAlternateLanguages`.
 *
 * Promoted out of the article route, which was the only page reading the stored list while
 * every other page hardcoded four locales. Settings holds nine, so five Gulf markets were
 * never declared (measured 2026-08-15). One builder now serves both.
 *
 * An entry without a `url` means "same Arabic content for that market", so it points at the
 * page's own canonical — a single-source site, many locales.
 */
export function buildHreflangLanguages(
  alternateLanguages: unknown,
  canonicalUrl: string,
  siteUrl: string,
): Record<string, string> {
  const out: Record<string, string> = {};

  if (Array.isArray(alternateLanguages)) {
    for (const entry of alternateLanguages as Array<{ hreflang?: string; url?: string }>) {
      const key = entry?.hreflang?.trim();
      if (!key) continue;
      const url = entry?.url?.trim();
      out[key] = url
        ? url.startsWith("http")
          ? url
          : `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`
        : canonicalUrl;
    }
  }

  // Never ship a page without a self-referencing fallback, whatever Settings holds.
  if (!out["x-default"]) out["x-default"] = canonicalUrl;
  return out;
}
