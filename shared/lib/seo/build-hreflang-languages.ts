/**
 * The hreflang map, from `Settings.defaultAlternateLanguages`.
 *
 * Promoted out of the article route, which was the only page reading the stored list while
 * every other page hardcoded its own locale set. Settings holds nine; the pages declared
 * four (`build-alternates.ts`) or two (`buildHreflang` in the admin generator), so five Gulf
 * markets were never declared and the listing pages shipped no `x-default` at all — measured
 * 2026-08-15. It lives in `shared/` because the admin writes the same map into the cached
 * blob that modonty renders: two writers of one value is exactly how they drifted apart.
 *
 * An entry without a `url` means "same Arabic content for that market", so it points at the
 * page's own canonical — a single-source site, many locales.
 */

import { absoluteUrl } from "./absolute-url";
import { normalizeHreflang } from "./normalize-hreflang";

export function buildHreflangLanguages(
  alternateLanguages: unknown,
  canonicalUrl: string,
  siteUrl: string,
): Record<string, string> {
  const out: Record<string, string> = {};

  if (Array.isArray(alternateLanguages)) {
    for (const entry of alternateLanguages as Array<{ hreflang?: string; url?: string }>) {
      // Normalised, not trusted. The stored list is edited by hand and carried the Open Graph
      // spelling `ar_SA`; `hreflang` wants `ar-SA`, and a malformed value makes Google drop
      // the annotation rather than read a smaller one.
      const key = normalizeHreflang(entry?.hreflang);
      if (!key) continue;
      const url = entry?.url?.trim();
      out[key] = url
        ? url.startsWith("http")
          ? url
          : absoluteUrl(url, siteUrl)
        : canonicalUrl;
    }
  }

  // Never ship a page without a self-referencing fallback, whatever Settings holds.
  if (!out["x-default"]) out["x-default"] = canonicalUrl;
  return out;
}
