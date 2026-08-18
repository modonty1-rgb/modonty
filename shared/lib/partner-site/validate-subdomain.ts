/**
 * Rules for a partner's subdomain label (`<label>.modonty.com`), the way DNS and the big
 * platforms enforce them:
 *  - RFC 1123 hostname label: letters/digits/hyphen only, must not start or end with a
 *    hyphen, 1–63 chars. We raise the floor to 3 (one/two-letter names are squatted or
 *    confusing) — same floor Shopify/Salla/GitHub Pages use.
 *  - Lower-case only (DNS is case-insensitive; one canonical form avoids duplicates).
 *  - No leading digit-only labels? Allowed by RFC, but we keep them (e.g. «360clinic»).
 *  - Reserved labels the platform itself uses or that would confuse (www, admin, console,
 *    api, mail, test, cdn, …) are rejected outright.
 */
export const SUBDOMAIN_MIN = 3;
export const SUBDOMAIN_MAX = 63;

export const RESERVED_SUBDOMAINS: readonly string[] = [
  "www", "admin", "console", "api", "app", "mail", "smtp", "imap", "pop", "ftp", "cdn",
  "static", "assets", "img", "images", "media", "test", "staging", "dev", "beta", "demo",
  "blog", "help", "support", "docs", "status", "login", "auth", "account", "accounts",
  "billing", "pay", "payments", "shop", "store", "modonty", "modo", "ns1", "ns2", "mx",
  "webmail", "autodiscover", "root", "localhost", "null", "undefined",
];

export type SubdomainError =
  | "empty"
  | "too-short"
  | "too-long"
  | "invalid-chars"
  | "hyphen-edge"
  | "reserved";

const LABEL_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

/** Normalise what the partner typed: trim, lower-case, strip a pasted scheme/host. */
export function normalizeSubdomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\.modonty\.com.*$/, "")
    .replace(/\/.*$/, "");
}

/** null = valid; otherwise the first rule it breaks (for a human message on the screen). */
export function validateSubdomain(label: string): SubdomainError | null {
  if (label.length === 0) return "empty";
  if (label.length < SUBDOMAIN_MIN) return "too-short";
  if (label.length > SUBDOMAIN_MAX) return "too-long";
  if (/^-|-$/.test(label)) return "hyphen-edge";
  if (!LABEL_RE.test(label)) return "invalid-chars";
  if (RESERVED_SUBDOMAINS.includes(label)) return "reserved";
  return null;
}
