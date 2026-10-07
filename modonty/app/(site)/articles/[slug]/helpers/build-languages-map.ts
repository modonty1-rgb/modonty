// Source of truth: Settings.defaultAlternateLanguages (seeded via /seo Auto-Maintenance hreflang Sync step).
// Entries without `url` default to the article's canonical (Arabic single-source content for all GCC + Egypt).
export function buildLanguagesMap(
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
        ? (url.startsWith("http") ? url : `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`)
        : canonicalUrl;
    }
  }
  if (!out["x-default"]) out["x-default"] = canonicalUrl;
  return out;
}
