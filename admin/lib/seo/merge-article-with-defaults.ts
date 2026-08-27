/**
 * Settings defaults UNDER the article's own values — never over them.
 *
 * Both storage paths used to write `{ ...article, ...articleDefaults }`. Spread order decides
 * the winner, and there the defaults came last, so a Settings default silently replaced a
 * value an editor had chosen on the row.
 *
 * The expensive case is `metaRobots`. A draft carries `noindex` (written by the publish flow),
 * and every regeneration path that does not pass robots explicitly — a client edit, a media
 * rename, the SEO cascade, the hreflang backfill — ran through here and rewrote it to
 * `index, follow`. The article stayed a draft; its stored metadata started telling Google to
 * index it.
 *
 * Two rules, and the second matters as much as the first:
 *
 *  1. The article wins. Defaults fill gaps, they do not overwrite decisions.
 *  2. "Present" means carrying a value. `null`, `undefined` and `""` are gaps — a plain
 *     `{ ...defaults, ...article }` would let an empty string on the row beat a real default,
 *     which is the same bug pointing the other way.
 *
 * `false` and `0` are values, not gaps: `isAccessibleForFree: false` and
 * `sitemapPriority: 0` must survive.
 */
export function mergeArticleWithDefaults<TArticle extends object, TDefaults extends object>(
  article: TArticle,
  defaults: TDefaults,
): TArticle & TDefaults {
  // Spread through `unknown`: `{ ...defaults, ...article }` has the intersection type, which
  // has named keys and no index signature, so assigning it straight to `Record<string, unknown>`
  // is rejected. The runtime object is exactly what it looks like; only the annotation needed
  // the widening step, and the `as TArticle & TDefaults` on the way out restores the real type.
  const merged = { ...defaults, ...article } as unknown as Record<string, unknown>;

  for (const [key, fallback] of Object.entries(defaults)) {
    const chosen = (article as Record<string, unknown>)[key];
    const isGap = chosen === undefined || chosen === null || (typeof chosen === "string" && chosen.trim() === "");
    if (isGap) merged[key] = fallback;
  }

  return merged as TArticle & TDefaults;
}
