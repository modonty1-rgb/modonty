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
