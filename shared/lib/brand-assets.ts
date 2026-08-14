/**
 * SHARED brand image assets — the ONE place the platform logo/avatar URLs live.
 *
 * They used to be hardcoded four times (modonty/lib/brand.ts + the admin and console
 * email templates) pointing at Cloudinary, which meant the admin migration button could
 * never reach them: they are not Media rows. Moved to Bunny (assets zone, `brand/`) on
 * 2026-07-30 so retiring Cloudinary cannot break the nav, JSON-LD publisher.logo, or any
 * email template.
 *
 * Plain string constants — no `server-only`, safe to import from client code and email
 * templates in all three apps.
 */

/** Square brand logo (PNG) — nav, email header, JSON-LD `publisher.logo`. */
export const BRAND_LOGO_URL = "https://modonty-asset.b-cdn.net/brand/modonty-logo.png";

/** Brand character/avatar (WebP) — feed fallback + some share contexts. */
export const BRAND_CHARACTER_URL = "https://modonty-asset.b-cdn.net/brand/modonty-avatar.webp";

/** Full wordmark (SVG) — console header + help pages. */
export const BRAND_WORDMARK_URL = "https://modonty-asset.b-cdn.net/brand/modonty-wordmark.svg";

/** Square platform icon (SVG) — admin sidebar + not-found page. */
export const BRAND_ICON_URL = "https://modonty-asset.b-cdn.net/brand/modonty-icon.svg";
