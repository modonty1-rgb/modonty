import type { LegalEntity } from "./organization-jsonld";
import { SITE_LOCALE_GREGORIAN } from "@modonty/shared/lib/constants/locale";

/**
 * The legal entity in the shape a page renders — one derivation, two consumers.
 *
 * /trust and /story both show the company's registration to the visitor, and both used to
 * read a hardcoded constant while the JSON-LD read the database. That is how the page ended
 * up telling the reader one CR number and Google another. Now both call this, so the two
 * pages cannot drift from each other or from the record.
 *
 * Everything here is a plain string or number, so /story can hand it straight to its client
 * component. Every field stays nullable: an empty column renders no row, never a label with
 * nothing after it.
 */
export interface LegalEntityDisplay {
  /** `Settings.orgContactEmail` — يُعرَض في صفّ الاتصال على /trust. */
  contactEmail: string | null;
  legalName: string | null;
  cr: string | null;
  crStatus: string | null;
  /**
   * Whether `crStatus` actually says the registration is live. The status used to be the
   * fixed word "نشط", so both pages hardcoded a green badge around it. Now the team types
   * it, and a lapsed registration must not keep rendering in confident green with a shield
   * on a page whose whole subject is trust.
   */
  isRegistrationActive: boolean;
  unifiedNumber: string | null;
  entityType: string | null;
  capital: string | null;
  /** Registration date, Gregorian, spelled in Arabic — "١٣ سبتمبر ٢٠٢٣". */
  registrationDate: string | null;
  /** Same date, year only, Latin digits — the /story strip sets it beside other numerals. */
  foundedYear: string | null;
  city: string | null;
  /** District on its own — the rail card shows «city، district» and leaves the street to the map. */
  district: string | null;
  country: string | null;
  /** City — district — street, skipping whatever is not filled. */
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Admin stores the ISO code (the unambiguous form for schema.org), but a visitor reads a
 * name. Anything not listed passes through as typed.
 */
const COUNTRY_NAMES_AR: Record<string, string> = {
  SA: "السعودية",
  EG: "مصر",
};

/**
 * `ar-SA` alone would print the Hijri date — its default calendar is islamic-umalqura, and
 * the certificate states a Gregorian one. `-u-ca-gregory` pins it. UTC because the column
 * holds midnight UTC, and a local zone would slide it to the previous day.
 */
const DATE_FORMAT = new Intl.DateTimeFormat(SITE_LOCALE_GREGORIAN, {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Only a status that unambiguously means "live" earns the active styling. Anything else —
 * "منتهي", "موقوف", a term we have not seen, or a typo — renders plain. Guessing wide here
 * would paint a lapsed registration green; guessing narrow only under-decorates a live one.
 */
const ACTIVE_STATUSES = new Set(["نشط", "active"]);

const isActive = (status: string | null) =>
  status != null && ACTIVE_STATUSES.has(status.trim().toLowerCase());

export function toLegalEntityDisplay(legal: LegalEntity): LegalEntityDisplay {
  const address = [legal.city, legal.district, legal.street].filter(Boolean).join(" — ");

  return {
    contactEmail: legal.contactEmail,
    legalName: legal.legalName,
    cr: legal.cr,
    crStatus: legal.crStatus,
    isRegistrationActive: isActive(legal.crStatus),
    unifiedNumber: legal.unifiedNumber,
    entityType: legal.entityType,
    capital: legal.capital,
    registrationDate: legal.foundingDate ? DATE_FORMAT.format(legal.foundingDate) : null,
    foundedYear: legal.foundingDate ? String(legal.foundingDate.getUTCFullYear()) : null,
    city: legal.city,
    district: legal.district,
    country: legal.country ? (COUNTRY_NAMES_AR[legal.country] ?? legal.country) : null,
    address: address || null,
    latitude: legal.latitude,
    longitude: legal.longitude,
  };
}
