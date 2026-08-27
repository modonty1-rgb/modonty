/**
 * A valid `hreflang` value, or nothing.
 *
 * Google states the format plainly: "The first code of the hreflang attribute is the language
 * code (in ISO 639-1 format) followed by an optional second code that represents the region
 * code (in ISO 3166-1 Alpha 2 format)" — joined by a HYPHEN.
 * <https://developers.google.com/search/docs/specialty/international/localized-versions>
 *
 * The builder used to copy whatever the Settings row held straight into the tag, so the
 * Open Graph spelling `ar_SA` (underscore) passed through untouched. `og:locale` wants the
 * underscore and `hreflang` wants the hyphen; the two fields were being filled from one
 * string, and only one of them was right.
 *
 * Returns the normalised value (`ar_SA` → `ar-SA`, `AR-sa` → `ar-SA`), passes `x-default`
 * through as the reserved value it is, and returns undefined for anything that is not a
 * language code — because a malformed annotation is not a smaller annotation. Google:
 * "those annotations may be ignored or not interpreted correctly".
 */
export function normalizeHreflang(value: string | null | undefined): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;

  if (raw.toLowerCase() === "x-default") return "x-default";

  // Accept the underscore form on the way in; it is never valid on the way out.
  const parts = raw.split(/[-_]/).filter(Boolean);
  if (parts.length === 0 || parts.length > 2) return undefined;

  const [language, region] = parts;
  if (!/^[A-Za-z]{2,3}$/.test(language)) return undefined;
  if (region === undefined) return language.toLowerCase();
  if (!/^[A-Za-z]{2}$/.test(region)) return undefined;

  return `${language.toLowerCase()}-${region.toUpperCase()}`;
}
