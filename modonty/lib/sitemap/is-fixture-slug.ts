/**
 * Fixture slugs, kept out of the sitemap: development leftovers pollute Google's view of the
 * site and spend crawl budget on pages nobody should reach.
 *
 * The rule used to be `endsWith("-test")` alone, and it was applied to five entity types out
 * of seven. Both halves were wrong, and the second one hid the first: the fixtures actually
 * measured in the sitemap on 24 Aug 2026 were `reel-test-mt1ci48p-1`, `dev-modonty-reel-1`
 * and friends — none of which END in `-test`, so widening the reach without widening the
 * pattern would have changed nothing.
 *
 * Every shape here is ASCII with an English prefix. Real content slugs on this site are
 * Arabic, so the false-positive risk is a slug someone deliberately names in English with one
 * of these prefixes — and the fix for that is to rename it, as it always was.
 *
 * This is still a naming convention, not a flag on the row. A real `isFixture` column would
 * be sturdier and is worth doing the day fixtures start being created by anything other than
 * a developer typing a name.
 */
const FIXTURE_SLUG = /(^|-)(test|dev|demo|e2e|sample|dummy)(-|$)/i;

export function isFixtureSlug(slug: string | null | undefined): boolean {
  return !!slug && FIXTURE_SLUG.test(slug);
}
