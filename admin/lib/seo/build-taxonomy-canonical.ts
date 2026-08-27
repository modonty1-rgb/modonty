import { entityUrl } from "@modonty/shared/lib/seo/absolute-url";

import { loadSiteUrl } from "./site-url";

/** The three taxonomy families whose pages modonty serves under a fixed path. */
type TaxonomySegment = "categories" | "tags" | "industries";

/**
 * The canonical URL for a taxonomy page, always rebuilt from the CURRENT slug.
 *
 * The three taxonomy updates used to persist `canonicalUrl` exactly as the form sent it, and
 * their generators honour whatever is stored (`category-seo-generator.ts`: `canonicalUrl ||
 * pageUrl`). So renaming a slug left the stored canonical — and every `@id` derived from it —
 * pointing at an address that no longer exists, while the page itself moved.
 *
 * The article path settled this a while ago and says so in its own comment: "Always regenerate
 * canonical from current slug — never trust DB value" (update-article.ts). The author and the
 * partner do the same. These three were the only ones left out; this is that rule, shared.
 */
export async function buildTaxonomyCanonical(
  segment: TaxonomySegment,
  slug: string,
): Promise<string> {
  const siteUrl = await loadSiteUrl();
  return entityUrl(segment, slug, siteUrl);
}
