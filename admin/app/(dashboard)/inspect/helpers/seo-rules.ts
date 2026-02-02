/**
 * SEO Rules — Official Documentation
 *
 * Meta (Title & Description):
 *   Google Search Central — snippet display ~600px title, ~920px desc.
 *   Best practice: Title 30–70 chars, Description 120–158 chars.
 *   https://developers.google.com/search/docs/appearance/snippet
 *
 * Open Graph:
 *   Required: og:title, og:type, og:image, og:url
 *   Image: 1200×630 (1.91:1)
 *   https://ogp.me/
 *
 * JSON-LD / Schema.org:
 *   ItemList: numberOfItems must match itemListElement.length
 *   Article: headline, image, datePublished, author recommended
 *   https://schema.org/ https://developers.google.com/search/docs/appearance/structured-data/article
 */

/** Google: title ~600px display; ~50–60 chars safe. Best practice 30–70. */
export const META_TITLE = {
  MIN: 30,
  MAX: 70,
  SOURCE: "https://developers.google.com/search/docs/appearance/snippet",
} as const;

/** Google: description ~920px desktop (~158), ~680px mobile (~120). Target 120–158. */
export const META_DESCRIPTION = {
  MIN: 120,
  MAX: 158,
  SOURCE: "https://developers.google.com/search/docs/appearance/snippet",
} as const;

/** Open Graph: required props for rich social sharing. */
export const OG_REQUIRED = ["og:title", "og:type", "og:image", "og:url"] as const;

/** Open Graph: recommended image size for best display. */
export const OG_IMAGE = {
  WIDTH: 1200,
  HEIGHT: 630,
  RATIO: "1.91:1",
  SOURCE: "https://ogp.me/",
} as const;

/** Schema.org/Google: Article recommended props. */
export const ARTICLE_RECOMMENDED = [
  "headline",
  "image",
  "datePublished",
  "dateModified",
  "author",
] as const;

/** Schema.org: ItemList recommended — numberOfItems should match itemListElement.length */
export const ITEMLIST_RECOMMENDED = [
  "itemListElement",
  "numberOfItems",
  "itemListOrder",
] as const;

/** Schema.org: Organization minimum for rich results */
export const ORGANIZATION_RECOMMENDED = ["name", "url"] as const;

export function isTitleOk(len: number): boolean {
  return len >= META_TITLE.MIN && len <= META_TITLE.MAX;
}

export function isDescOk(len: number): boolean {
  return len >= META_DESCRIPTION.MIN && len <= META_DESCRIPTION.MAX;
}
