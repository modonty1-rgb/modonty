/**
 * Percent-encode a URL that is about to be written into JSON-LD.
 *
 * Why (measured 28 Aug 2026): 188 of 718 URLs inside the stored article JSON-LD carried raw
 * Arabic — almost all of them Bunny media paths built from Arabic partner and article names,
 * e.g. `https://modonty-clients.b-cdn.net/general/شركة-جبر-سيو/img-3pih4munx.png`. Those are
 * stored file addresses, not URLs any generator assembles, so `absoluteUrl()` never saw them.
 *
 * Google's URL-structure page recommends the percent-encoded form for non-ASCII paths and
 * shows an Arabic example doing exactly this; RFC 3986 §2.5 says such text "should first be
 * encoded as octets according to the UTF-8 character encoding". Browsers encode on the wire
 * anyway, so the link works either way — but the string we *declare* to a validator should be
 * the one the spec calls a URI.
 *
 * `new URL().href` is the whole implementation: its path setter percent-encodes non-ASCII and
 * leaves existing `%XX` alone, so running it twice returns the same string (verified on four
 * real samples including an already-encoded one and one carrying a `#fragment`).
 *
 * A value that is not a parseable URL is returned untouched — this helper's job is encoding,
 * not validation, and swallowing a bad URL here would hide it from the validator that should
 * report it.
 */
export function encodeUrlForJsonLd(value: string): string;
export function encodeUrlForJsonLd(value: null | undefined): undefined;
export function encodeUrlForJsonLd(value: string | null | undefined): string | undefined;
export function encodeUrlForJsonLd(value: string | null | undefined): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  try {
    return new URL(raw).href;
  } catch {
    return raw;
  }
}

/** Property names whose value is a URL in schema.org. Only these are rewritten. */
const URL_KEYS = new Set([
  "@id",
  "url",
  "contentUrl",
  "image",
  "logo",
  "thumbnailUrl",
  "mainEntityOfPage",
  "sameAs",
  "acquireLicensePage",
  "license",
  "item",
  "target",
]);

/**
 * Walk a whole JSON-LD graph and percent-encode every URL-valued string.
 *
 * Applying this at the storage boundary rather than inside each builder is deliberate: the
 * image URLs reach the graph from a dozen places (an org logo, a collection item's thumbnail,
 * a partner's cover), and fixing them one call site at a time leaves the next new builder to
 * reintroduce the same defect silently. Measured 28 Aug 2026 after the per-builder attempt:
 * /,  /clients and /trending still shipped 98 raw-Arabic URLs between them.
 *
 * Only the keys above are touched, so free text is never mangled, and `encodeUrlForJsonLd`
 * leaves a non-URL string exactly as it found it.
 */
export function encodeGraphUrls<T>(node: T): T {
  if (Array.isArray(node)) return node.map((n) => encodeGraphUrls(n)) as unknown as T;
  if (!node || typeof node !== "object") return node;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (URL_KEYS.has(key) && typeof value === "string") {
      out[key] = encodeUrlForJsonLd(value) ?? value;
    } else if (URL_KEYS.has(key) && Array.isArray(value)) {
      out[key] = value.map((v) => (typeof v === "string" ? encodeUrlForJsonLd(v) ?? v : encodeGraphUrls(v)));
    } else {
      out[key] = encodeGraphUrls(value);
    }
  }
  return out as T;
}
