/**
 * App-wide constants for the public site — one import path, `@/constants`.
 *
 * What earns a place here: a value that is FIXED (not admin-editable), and that more than
 * one route reads. A constant with a single consumer stays in that route's folder — moving
 * it here would separate the number from the only code that reads it, which is the exact
 * grab-bag `.claude/rules/folder-structure.md` exists to prevent.
 *
 * Split by topic, not by type: a new constant joins the file whose subject it shares, or
 * gets its own file. This barrel only re-exports — it never declares a value itself.
 */

export {
  MODONTY_AUTHOR_SLUG,
  SITE_URL,
  LOGO_URL,
  CHARACTER_URL,
  BRAND_AVATAR_RADIUS,
} from "./brand";

export { SAUDI_BUSINESS_VERIFY_URL, CR_CERTIFICATE_FALLBACK_IMAGE } from "./legal";

export { CONTACT_EMAIL, NOREPLY_FROM } from "./contact";

export { SHOW_ARTICLE_ENGAGEMENT_STATS, SHOW_CLIENT_ENGAGEMENT_STATS } from "./feature-flags";
