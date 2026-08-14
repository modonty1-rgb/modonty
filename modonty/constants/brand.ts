/**
 * Brand identity — the FIXED facts about Modonty itself.
 *
 * Plain string constants → zero client-JS / bundle / runtime cost when imported into
 * Server Components, layout, email templates, or edge. Change a value HERE and it
 * propagates everywhere — no scattered literals, no spelling drift.
 *
 * What does NOT belong here: anything the team edits (SEO titles, social links, banner,
 * OG image) lives in the DB Settings table, and the umbrella entity's registration facts
 * live on the core Client row (`getLegalEntity()`). A constant for either would go stale
 * silently the day someone changes it in admin.
 */

import { BRAND_LOGO_URL, BRAND_CHARACTER_URL } from "@modonty/shared/lib/brand-assets";

// Display name — Arabic UI. Official spelling = «مدونتي» (from «مدوّنة»), NOT «مودونتي» (wrong transliteration).
export const BRAND_AR = "مدونتي";

// Latin name — used in JSON-LD Organization/WebSite name, og:site_name, email "from".
export const BRAND_EN = "Modonty";

// The one platform-brand author. Its /authors/[slug] page + article author node render as
// the Modonty Organization (not a Person). Locked to this slug in admin (update-author).
export const MODONTY_AUTHOR_SLUG = "modonty";

// Canonical site URL (www-consistent, no trailing slash). Env wins; constant is the fallback.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com").replace(/\/+$/, "");

// Brand logo (square PNG) — used in nav, email, JSON-LD logo.
// Brand character/avatar (used in feed fallback + some OG contexts).
// Both live on Bunny and are defined ONCE in shared so the admin and console email
// templates read the same value instead of re-hardcoding it (2026-07-30).
export const LOGO_URL = BRAND_LOGO_URL;
export const CHARACTER_URL = BRAND_CHARACTER_URL;

/**
 * Client/partner logos & marks use a SQUIRCLE (rounded square), matching the modonty "m"
 * mark, so they read as a "brand/entity". People (users, authors, team members, commenters)
 * stay CIRCLE per convention.
 *
 * Single knob: change the radius here and every brand avatar follows. It's a real Tailwind
 * arbitrary value (not a custom class) so tailwind-merge correctly overrides a base
 * `rounded-full` (e.g. on shadcn <Avatar>).
 */
export const BRAND_AVATAR_RADIUS = "rounded-[28%]";
