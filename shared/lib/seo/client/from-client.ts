// Adapter: maps a raw Client DB row (any surface's shape) into the ClientSeoInput
// the scorer needs. Keeps every caller a one-liner and the field list in ONE place.
// Accepts a loose record so admin (ClientWithRelations) + console selects both fit.

import type { ClientSeoInput } from "./seo-score";

/**
 * Paste this into any Prisma `select` whose rows will be scored — the client-side twin of
 * `ARTICLE_SEO_SELECT`. Every field is required: `clientToSeoInput` cannot tell "not
 * selected" from "empty", so omitting one silently drags every row to the same low number.
 * Spread it, do not retype it.
 */
export const CLIENT_SEO_SELECT = {
  nextjsMetadata: true,
  name: true,
  jsonLdStructuredData: true,
  jsonLdValidationReport: true,
  url: true,
  logoMediaId: true,
  heroImageMediaId: true,
  description: true,
  alternateName: true,
  slogan: true,
  phone: true,
  email: true,
  contactType: true,
  addressStreet: true,
  addressCity: true,
  addressRegion: true,
  addressPostalCode: true,
  addressCountry: true,
  sameAs: true,
  legalName: true,
  foundingDate: true,
  vatID: true,
  taxID: true,
  commercialRegistrationNumber: true,
  businessActivityCode: true,
  numberOfEmployees: true,
  addressLatitude: true,
  addressLongitude: true,
  openingHoursSpecification: true,
  priceRange: true,
  gbpPlaceId: true,
  organizationType: true,
} as const;

export function clientToSeoInput(c: Record<string, unknown> | null | undefined): ClientSeoInput {
  const g = <T>(k: string): T | null => (c ? ((c[k] as T) ?? null) : null);
  return {
    // meta
    nextjsMetadata: c?.["nextjsMetadata"],
    name: g<string>("name"),
    // jsonLd validity
    jsonLdStructuredData: g<string>("jsonLdStructuredData"),
    jsonLdValidationReport: (c?.["jsonLdValidationReport"] as ClientSeoInput["jsonLdValidationReport"]) ?? null,
    // identity
    url: g<string>("url"),
    logoMediaId: g<string>("logoMediaId"),
    heroImageMediaId: g<string>("heroImageMediaId"),
    description: g<string>("description"),
    alternateName: g<string>("alternateName"),
    slogan: g<string>("slogan"),
    // contact
    phone: g<string>("phone"),
    email: g<string>("email"),
    contactType: g<string>("contactType"),
    addressStreet: g<string>("addressStreet"),
    addressCity: g<string>("addressCity"),
    addressRegion: g<string>("addressRegion"),
    addressPostalCode: g<string>("addressPostalCode"),
    addressCountry: g<string>("addressCountry"),
    // presence
    sameAs: (c?.["sameAs"] as string[]) ?? null,
    legalName: g<string>("legalName"),
    foundingDate: g<Date | string>("foundingDate"),
    // identifiers
    vatID: g<string>("vatID"),
    taxID: g<string>("taxID"),
    commercialRegistrationNumber: g<string>("commercialRegistrationNumber"),
    businessActivityCode: g<string>("businessActivityCode"),
    numberOfEmployees: g<string>("numberOfEmployees"),
    // local
    addressLatitude: g<number>("addressLatitude"),
    addressLongitude: g<number>("addressLongitude"),
    openingHoursSpecification: c?.["openingHoursSpecification"],
    priceRange: g<string>("priceRange"),
    gbpPlaceId: g<string>("gbpPlaceId"),
    // classification
    organizationType: g<string>("organizationType"),
  };
}
