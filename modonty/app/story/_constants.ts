/**
 * Shared constants for /story page components.
 */
import { BRAND_AR, LEGAL } from "@/lib/brand";

// Brand logo — used by spotlight widgets + page.tsx OG_IMAGE
export const MODONTY_LOGO_URL =
  "https://res.cloudinary.com/dfegnpgwx/image/upload/v1768724691/final-01_fdnhom.svg";

export const STORY_OG_IMAGE = MODONTY_LOGO_URL;

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
