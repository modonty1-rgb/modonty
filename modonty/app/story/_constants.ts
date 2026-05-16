/**
 * Shared constants for /story page components.
 */

// Brand logo — used by spotlight widgets + page.tsx OG_IMAGE
export const MODONTY_LOGO_URL =
  "https://res.cloudinary.com/dfegnpgwx/image/upload/v1768724691/final-01_fdnhom.svg";

export const STORY_OG_IMAGE = MODONTY_LOGO_URL;

/**
 * Legal entity facts for the Trust Strip + JSON-LD Organization schema.
 * Single source of truth for CR + capital + DBA + address + verification.
 */
export const LEGAL_ENTITY = {
  brand: "مدونتي",
  dba: "حديقة البستان للديكور",
  cr: "4030560460",
  capital: "8,000,000",
  currency: "ر.س",
  city: "جدة",
  country: "السعودية",
  countryFull: "المملكة العربية السعودية",
  foundedYear: "2024",
  verifyUrl: "https://mc.gov.sa/ar/eservices/Pages/Commercial-data.aspx",
} as const;
