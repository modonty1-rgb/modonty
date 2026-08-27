/**
 * The share image's alt text — taken from the database, or not declared at all.
 *
 * Open Graph defines the field as "A description of what is in the image (not a caption)"
 * <https://ogp.me>. A value carrying no letter is not a description in any language, and it
 * is what a screen reader reads out to someone who cannot see the image. Measured on
 * production 27 Aug 2026 across the 20 partner pages that declare an og:image: fourteen
 * served `og:image:alt` content="0" and one served content="1".
 *
 * So the test is the least a description must pass: it contains at least one letter. Digits
 * and punctuation on their own do not. Returns undefined when the value fails, and the
 * caller then declares no alt at all instead of inventing one — the same contract as
 * `imageMimeFromUrl`, and the reason neither helper carries a fallback string.
 */
export function shareImageAlt(value: string | null | undefined): string | undefined {
  const text = value?.trim();
  if (!text) return undefined;
  return /\p{L}/u.test(text) ? text : undefined;
}
