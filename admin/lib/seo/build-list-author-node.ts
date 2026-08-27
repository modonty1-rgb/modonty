import { entityUrl } from "@modonty/shared/lib/seo/absolute-url";
import { buildSiteEntityIds } from "@modonty/shared/lib/seo/site-entity-ids";

/**
 * Author slugs that ARE the platform brand, not a human. Mirrors `PLATFORM_AUTHOR_SLUGS`
 * in knowledge-graph-generator.ts — kept in step deliberately: the two files decide the
 * same question and drifted once already.
 */
const PLATFORM_AUTHOR_SLUGS = ["modonty"] as const;

/**
 * The `author` value for an Article node inside a listing page's ItemList.
 *
 * The list builders used to write `{ "@type": "Person", name: article.author.name }` for
 * every article — Modonty included. The article's own page says the opposite: Modonty is the
 * site's Organization, carrying the same `@id` as the `#organization` node. So one entity was
 * a Person on /trending and an Organization on the article it links to, and the two are
 * disjoint types in schema.org — nothing could reconcile them.
 *
 * The platform brand is emitted as a bare `@id` reference to that Organization, so the list
 * points at the entity the rest of the site already describes instead of redescribing it.
 * A human author stays a Person.
 */
export function buildListAuthorNode(
  author: { name?: string | null; slug?: string | null },
  siteUrl: string,
): Record<string, unknown> {
  const slug = (author.slug || "").toLowerCase();
  if ((PLATFORM_AUTHOR_SLUGS as readonly string[]).includes(slug)) {
    return { "@id": buildSiteEntityIds(siteUrl).organization };
  }
  return {
    "@type": "Person",
    ...(author.name?.trim() && { name: author.name.trim() }),
    ...(author.slug && { url: entityUrl("authors", author.slug, siteUrl) }),
  };
}
