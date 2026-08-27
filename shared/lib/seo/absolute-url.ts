/**
 * The one safe way to turn `Settings.siteUrl` + a path into a public URL.
 *
 * Every SEO generator used to write `` `${siteUrl}/${slug}` ``. Two things came out of that
 * join, and both of them shipped to Google:
 *
 *  1. **An Arabic slug went out raw.** Real content slugs on this site are Arabic, and a raw
 *     Arabic path is not a URI at all — RFC 3986 §2.5 says such text "should first be encoded
 *     as octets according to the UTF-8 character encoding; then only those octets that do not
 *     correspond to characters in the unreserved set should be percent-encoded". Google says
 *     the same in plain words on its URL-structure page, using an Arabic example: the
 *     percent-encoded form is the recommended one, the raw form is not.
 *  2. **A doubled slash.** `Settings.siteUrl` is a field a human types; the moment someone
 *     ends it with `/`, the join produced `https://host//articles/x` — a different address
 *     than the one in the sitemap.
 *
 * `new URL()` closes both at once: the `pathname` setter percent-encodes, and the base is
 * parsed rather than pasted, so a trailing slash cannot survive.
 *
 * A base that is not a URL throws here instead of silently becoming part of a canonical.
 */

/** Thrown when the base URL handed to a builder is not a parseable URL. */
export class InvalidSiteUrlError extends Error {
  constructor(value: string) {
    super(
      `رابط الموقع غير صالح: «${value}» — الحقل Settings.siteUrl لازم يكون رابطاً كاملاً مع البروتوكول، مثل https://www.example.com`,
    );
    this.name = "InvalidSiteUrlError";
  }
}

function parseBase(base: string): URL {
  const value = String(base ?? "").trim();
  try {
    return new URL(value);
  } catch {
    throw new InvalidSiteUrlError(value);
  }
}

/**
 * Absolute URL for `path` under `base`.
 *
 * `path` may carry a query and/or a fragment (`/clients/x#organization`); both are kept out
 * of the path so `#` and `?` are not themselves percent-encoded.
 *
 * A path on a base that already has one (a partner's `articlesBaseUrl` = `https://x.com/blog`)
 * is APPENDED, not replaced — `new URL("/a", "https://x.com/blog")` would drop `/blog`.
 */
export function absoluteUrl(path: string, base: string): string {
  const url = parseBase(base);

  const raw = String(path ?? "");
  const hashAt = raw.indexOf("#");
  const hash = hashAt >= 0 ? raw.slice(hashAt) : "";
  const beforeHash = hashAt >= 0 ? raw.slice(0, hashAt) : raw;

  const queryAt = beforeHash.indexOf("?");
  const search = queryAt >= 0 ? beforeHash.slice(queryAt) : "";
  const pathOnly = queryAt >= 0 ? beforeHash.slice(0, queryAt) : beforeHash;

  const basePath = url.pathname.replace(/\/+$/, "");
  const relative = pathOnly.replace(/^\/+/, "");

  url.pathname = relative ? `${basePath}/${relative}` : basePath || "/";
  url.search = search;
  url.hash = hash;

  return url.href;
}

/**
 * Absolute URL for one entity: `{base}/{segment}/{slug}`, plus an optional `#fragment`
 * for JSON-LD `@id` nodes.
 */
export function entityUrl(segment: string, slug: string, base: string, fragment?: string): string {
  const cleanSegment = String(segment ?? "").replace(/^\/+|\/+$/g, "");
  const suffix = fragment ? `#${fragment.replace(/^#/, "")}` : "";
  return absoluteUrl(`/${cleanSegment}/${slug}${suffix}`, base);
}

/**
 * The site's origin with no trailing slash — the shape `@id` prefixes and log lines expect
 * (`{origin}/#organization`, not `{origin}//#organization`).
 */
export function siteOrigin(base: string): string {
  return parseBase(base).origin;
}

/**
 * Make a possibly-relative URL absolute, leaving an already-absolute one untouched.
 * Replaces the `if (u.startsWith("/")) return `${siteUrl}${u}`` helper that each JSON-LD
 * builder had copied for itself.
 */
export function ensureAbsolute(url: string | null | undefined, base: string): string | undefined {
  const value = url?.trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return absoluteUrl(value, base);
}
