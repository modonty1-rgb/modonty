/**
 * «2026–27_Saudi_Pro_League» — the English Wikipedia article for the season running on `now`.
 *
 * The season opens in August (2026–27 ran 13 Aug 2026 → 28 May 2027 per API-Football), so from
 * August on it is this year's season and before that last year's. The dash is an en dash, as
 * Wikipedia titles the page.
 */
export function seasonArticleTitle(now: Date): string {
  const year = now.getUTCFullYear();
  const start = now.getUTCMonth() >= 7 ? year : year - 1;
  return `${start}–${String((start + 1) % 100).padStart(2, "0")}_Saudi_Pro_League`;
}
