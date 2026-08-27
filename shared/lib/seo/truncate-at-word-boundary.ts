/**
 * Cut text down to a length limit without ever cutting through a word.
 *
 * Every SEO snippet in this repo used to end with a blind `slice(0, n) + "..."`, and in
 * Arabic that lands inside a word far more often than in English: measured 27 Aug 2026 on a
 * real sentence, the seoTitle path produced «…يتطلب فهماً عميقاً لسل...» (half of «لسلوك»)
 * and the JSON-LD path produced «…وهذا يشمل اخت...» (half of «اختيار»). Those strings are not
 * debug output — they are written to `Article.excerpt` / `seoDescription` and served to
 * Google and to the reader. Six call sites each carried their own copy of the same cut, and
 * only two of them had ever learned the word boundary, so the bug got fixed twice and shipped
 * four more times. This is the one cut they all call now.
 *
 * `maxLength` is a house limit for how much of a snippet we are willing to bake, NOT a Google
 * rule — Google states «there's no limit on how long a meta description can be» and rewrites
 * the snippet per query anyway.
 * <https://developers.google.com/search/docs/appearance/snippet>
 *
 * The returned string, suffix included, is never longer than `maxLength`.
 *
 * The one case that still cuts mid-word is a single token longer than the budget (a URL, an
 * unbroken identifier): there is no word boundary to cut at, so the raw cut is the only
 * answer. The 10-character floor below is what distinguishes that case from a normal
 * sentence, and it is the same floor `generateSEOTitle` has always used.
 */
export function truncateAtWordBoundary(
  text: string,
  maxLength: number,
  suffix: string = "...",
): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  const budget = Math.max(0, maxLength - suffix.length);
  const cut = text.slice(0, budget);

  // Drop the trailing partial word, plus the whitespace holding it on. Arabic separates
  // words with an ordinary space, so this is the same operation in both scripts; diacritics
  // and tatweel are non-space and stay attached to the word they belong to.
  const atBoundary = cut.replace(/\s+\S*$/u, "");

  return (atBoundary.length > 10 ? atBoundary : cut).trimEnd() + suffix;
}
