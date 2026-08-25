/**
 * Make a `googlebot` directive that can only be MORE restrictive than the page's `robots`.
 *
 * Google, on conflicting robots rules: "the search engine will use the sum of the negative
 * rules" and "in the case of conflicting robots rules, the more restrictive rule applies"
 * (developers.google.com/search/docs/crawling-indexing/robots-meta-tag). A crawler-specific
 * tag is meant to ADD a restriction for that crawler, never to lift one the generic tag set.
 *
 * The code did the opposite: `defaultGooglebot?.trim() || robots` let one Settings field
 * override every page's own directive. Measured on /reels, 25 Aug 2026 — the page served
 * `robots: noindex, nofollow` beside `googlebot: index, follow`, two directives contradicting
 * each other in one head. The reverse pairing is the dangerous one: a single Settings value
 * reading "noindex" would have told Googlebot to drop every page on the site.
 *
 * @param robots    The page's own directive, e.g. "noindex, nofollow".
 * @param candidate The googlebot directive being proposed (Settings default, or a stored one).
 * @returns The candidate with every negative from `robots` forced back in.
 */
export function tightenGooglebot(robots: string, candidate: string): string {
  const parts = candidate
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const lowerRobots = robots.toLowerCase();

  for (const [negative, positive] of [
    ["noindex", "index"],
    ["nofollow", "follow"],
  ] as const) {
    if (!lowerRobots.includes(negative)) continue;
    if (parts.some((p) => p.toLowerCase() === negative)) continue;

    // Replace the positive counterpart in place rather than appending the negative next to
    // it — "index, noindex" in one tag is exactly the contradiction this function exists to
    // remove, even though Google would resolve it the restrictive way.
    const at = parts.findIndex((p) => p.toLowerCase() === positive);
    if (at >= 0) parts[at] = negative;
    else parts.unshift(negative);
  }

  return parts.join(", ");
}
