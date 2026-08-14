/**
 * Shared constants for /story page components.
 */
import { BRAND_WORDMARK_URL } from "@modonty/shared/lib/brand-assets";

import { BRAND_AR, LEGAL } from "@/lib/brand";

/**
 * Brand logo — spotlight widgets + page.tsx OG_IMAGE.
 * Was a hardcoded Cloudinary SVG; verified byte-identical (sha 0057be46…, 5728 B) to the
 * shared wordmark already on Bunny, so it reuses that constant instead of a second copy.
 */
export const MODONTY_LOGO_URL = BRAND_WORDMARK_URL;

export const STORY_OG_IMAGE = MODONTY_LOGO_URL;

/** Bunny assets zone, `brand/story/` — team + partner photos for this page only. */
const STORY_ASSETS = "https://modonty-asset.b-cdn.net/brand/story";

export const storyTeamImage = (file: string) => `${STORY_ASSETS}/team/${file}`;
export const storyPartnerImage = (file: string) => `${STORY_ASSETS}/partners/${file}`;

/**
 * Legal entity facts for the Trust Strip + JSON-LD Organization schema.
 * Single source of truth for CR + capital + DBA + address + verification.
 */
export const LEGAL_ENTITY = {
  brand: BRAND_AR,
  dba: LEGAL.dba,
  cr: LEGAL.cr,
  capital: LEGAL.capital,
  currency: "ر.س",
  city: LEGAL.city,
  country: LEGAL.country,
  countryFull: "المملكة العربية السعودية",
  foundedYear: LEGAL.foundedYear,
  verifyUrl: "https://eauthenticate.saudibusiness.gov.sa/inquiry",
} as const;
