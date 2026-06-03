/**
 * Canonical Organization JSON-LD — single source of truth for the legal-entity schema.
 *
 * Built from the FIXED identity facts in `@/lib/brand` (verified against the official MC
 * commercial registration via its QR, 2026-06-03). Consumed by /trust AND /story so the two
 * pages never publish conflicting Organization data to search engines.
 *
 * Capital is intentionally NOT exposed (owner decision — it adds no trust value).
 */
import { BRAND_AR, BRAND_EN, SITE_URL, LOGO_URL, CONTACT_EMAIL, LEGAL } from "@/lib/brand";

export const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND_AR,
  alternateName: BRAND_EN,
  legalName: LEGAL.legalName,
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: LOGO_URL },
  identifier: [
    { "@type": "PropertyValue", propertyID: "Saudi Commercial Registration", value: LEGAL.cr },
    { "@type": "PropertyValue", propertyID: "Saudi Unified Entity Number", value: LEGAL.unifiedNumber },
  ],
  foundingDate: LEGAL.foundedYear,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${LEGAL.street}، ${LEGAL.district}`,
    addressLocality: LEGAL.city,
    addressRegion: LEGAL.region,
    addressCountry: LEGAL.countryCode,
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: CONTACT_EMAIL,
      availableLanguage: ["ar", "en"],
    },
  ],
  knowsAbout: [
    "Saudi Vision 2030",
    "رؤية المملكة 2030",
    "Arabic SEO",
    "Content marketing for Arab businesses",
    "Content-as-a-Service",
  ],
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Saudi Arabia",
    alternateName: "المملكة العربية السعودية",
  },
} as const;
