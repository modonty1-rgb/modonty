/**
 * Public-site feature flags. One place to flip a feature on/off.
 */

/**
 * Show the per-article engagement counts (likes / comments / views / favorites)
 * on article cards + trending cards.
 *
 * TEMPORARILY OFF: early-stage numbers are mostly zero and weaken trust.
 * Flip back to `true` once articles + the blog have real engagement.
 */
export const SHOW_ARTICLE_ENGAGEMENT_STATS = false;

/**
 * Show the weak engagement counts (views / followers) in the client page hero
 * stats bar (/clients/[slug]). Articles count + star rating stay (credible).
 *
 * TEMPORARILY OFF: early-stage views/followers are tiny and weaken trust.
 * Flip back to `true` once client pages have real traction.
 */
export const SHOW_CLIENT_ENGAGEMENT_STATS = false;
