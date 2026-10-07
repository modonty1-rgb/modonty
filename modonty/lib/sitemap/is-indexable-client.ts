/**
 * The same "substantive" test `resolveClientPageState` applies before it returns "not-ready",
 * fed by the same three signals `generateMetadata` uses to decide noindex on the partner page
 * (description ?? seoDescription, and the published-article count). Kept as one expression so
 * the two stay readable side by side: if the page's gate moves, this moves with it.
 */
export function isIndexableClient(c: {
  description: string | null;
  seoDescription: string | null;
  _count: { articles: number };
}): boolean {
  return !!(c.description || c.seoDescription)?.trim() || c._count.articles > 0;
}
