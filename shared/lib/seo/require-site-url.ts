import { SiteUrlMissingError } from "./site-url-error";

/**
 * Return the site's base URL, or refuse.
 *
 * Every SEO generator used to write `settings.siteUrl || "https://www.modonty.com"`. The
 * literal looked like a safety net and was the opposite: the value becomes canonical,
 * hreflang and every JSON-LD `@id` in the stored blob, so a blank Settings row published a
 * host nobody chose while the screen said "saved". One guard, one message, no literal.
 */
export function requireSiteUrl(value: string | null | undefined): string {
  const siteUrl = value?.trim();
  if (!siteUrl) throw new SiteUrlMissingError();
  return siteUrl;
}
