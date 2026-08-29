import "server-only";

import { cacheTag, cacheLife } from "next/cache";
import { buildSiteEntityIds } from "@modonty/shared/lib/seo/site-entity-ids";

import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";
import { SITE_URL, LOGO_URL } from "@/constants";

/**
 * The legal entity behind Modonty — read from Settings, never hardcoded.
 *
 * Settings is the project's own record; the Client table is for customers. So Modonty's
 * commercial registration lives here, the team edits it in admin, and /trust + /story read
 * it from one place. A field the team has not filled comes back null and its row is simply
 * not rendered — a missing fact beats a stale constant pretending to be current.
 *
 * Verification URL is NOT entity data: it is the same government portal for every CR, so
 * it lives with the other non-entity constants in `@/constants/legal`.
 */
export interface LegalEntity {
  /** `Settings.siteName` — الاسم الذي يراه الزائر، وهو ما تعرضه جوجل. */
  siteName: string | null;
  /** `Settings.alternateName` — الاسم الثاني للماركة على الكيان نفسه (schema.org). */
  alternateName: string | null;
  /** `Settings.orgContactEmail` — بريد الاتصال المعلَن في بنية المؤسسة. */
  contactEmail: string | null;
  /** `Settings.orgContactTelephone` — الهاتف المعلَن في نفس البنية، وصفحة الاتصال تعرضه. */
  contactTelephone: string | null;
  legalName: string | null;
  cr: string | null;
  crStatus: string | null;
  unifiedNumber: string | null;
  entityType: string | null;
  capital: string | null;
  street: string | null;
  district: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  foundingDate: Date | null;
}

/** Every field null — returned when Settings has no row yet. */
export const EMPTY_LEGAL_ENTITY: LegalEntity = {
  siteName: null, alternateName: null, contactEmail: null, contactTelephone: null,
  legalName: null, cr: null, crStatus: null, unifiedNumber: null, entityType: null,
  capital: null, street: null, district: null, city: null, region: null, country: null,
  latitude: null, longitude: null, foundingDate: null,
};

export async function getLegalEntity(): Promise<LegalEntity> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");

  const s = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: {
      siteName: true,
      alternateName: true,
      orgContactEmail: true,
      orgContactTelephone: true,
      orgLegalName: true,
      orgCommercialRegistrationNumber: true,
      orgCommercialRegistrationStatus: true,
      orgUnifiedNationalNumber: true,
      orgLegalForm: true,
      orgCapitalAmount: true,
      orgFoundingDate: true,
      orgStreetAddress: true,
      orgAddressNeighborhood: true,
      orgAddressLocality: true,
      orgAddressRegion: true,
      orgAddressCountry: true,
      orgGeoLatitude: true,
      orgGeoLongitude: true,
    },
  });

  if (!s) return EMPTY_LEGAL_ENTITY;

  // A blank string is what an emptied admin field leaves behind — treat it as "not filled"
  // so a row never renders as a label with nothing after it.
  const t = (v: string | null) => v?.trim() || null;

  return {
    siteName: t(s.siteName),
    alternateName: t(s.alternateName),
    contactEmail: t(s.orgContactEmail),
    contactTelephone: t(s.orgContactTelephone),
    legalName: t(s.orgLegalName),
    cr: t(s.orgCommercialRegistrationNumber),
    crStatus: t(s.orgCommercialRegistrationStatus),
    unifiedNumber: t(s.orgUnifiedNationalNumber),
    entityType: t(s.orgLegalForm),
    capital: t(s.orgCapitalAmount),
    street: t(s.orgStreetAddress),
    district: t(s.orgAddressNeighborhood),
    city: t(s.orgAddressLocality),
    region: t(s.orgAddressRegion),
    country: t(s.orgAddressCountry),
    latitude: s.orgGeoLatitude,
    longitude: s.orgGeoLongitude,
    foundingDate: s.orgFoundingDate,
  };
}

/**
 * schema.org takes either the ISO-3166 alpha-2 code or the country's plain name for
 * `addressCountry`; the code is the unambiguous form. Admin stores what the team typed, so
 * the names we actually hold map to their code and anything else passes through as text.
 */
const COUNTRY_CODES: Record<string, string> = {
  "السعودية": "SA",
  "المملكة العربية السعودية": "SA",
  "saudi arabia": "SA",
  "مصر": "EG",
  "egypt": "EG",
};

const toCountryCode = (c: string) =>
  COUNTRY_CODES[c.trim()] ?? COUNTRY_CODES[c.trim().toLowerCase()] ?? c;

/**
 * Canonical Organization JSON-LD. Consumed by /trust AND /story so the two pages never
 * publish conflicting Organization data. Any field the team has not filled is OMITTED
 * rather than emitted empty — publishing `"legalName": ""` to Google is worse than nothing.
 * Capital is intentionally never exposed (owner decision — it adds no trust value).
 */
export function buildOrganizationJsonLd(legal: LegalEntity): Record<string, unknown> {
  const identifier = [
    legal.cr && {
      "@type": "PropertyValue",
      propertyID: "Saudi Commercial Registration",
      value: legal.cr,
    },
    legal.unifiedNumber && {
      "@type": "PropertyValue",
      propertyID: "Saudi Unified Entity Number",
      value: legal.unifiedNumber,
    },
  ].filter(Boolean);

  const streetAddress = [legal.street, legal.district].filter(Boolean).join("، ");
  const address = {
    "@type": "PostalAddress",
    ...(streetAddress && { streetAddress }),
    ...(legal.city && { addressLocality: legal.city }),
    ...(legal.region && { addressRegion: legal.region }),
    ...(legal.country && { addressCountry: toCountryCode(legal.country) }),
  };

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": buildSiteEntityIds(SITE_URL).organization,
    // الاسمان من القاعدة لا من ثوابت الكود. كانا `BRAND_AR` و`BRAND_EN`، فتغيير اسم
    // الماركة كان يحتاج نشرةً — وجوجل تنصّ: الاسم في البيانات المنظَّمة يطابق ما تسمّي
    // به موقعك على رئيسيتك، وهذا قرار تحريري يملكه الأدمن لا الكود.
    ...(legal.siteName && { name: legal.siteName }),
    ...(legal.alternateName && { alternateName: legal.alternateName }),
    ...(legal.legalName && { legalName: legal.legalName }),
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: LOGO_URL },
    ...(identifier.length > 0 && { identifier }),
    ...(legal.foundingDate && { foundingDate: legal.foundingDate.toISOString().slice(0, 10) }),
    ...(Object.keys(address).length > 1 && { address }),
    // تُبنى فقط حين يحمل العمود بريداً: عقدةُ اتصالٍ بلا بريد لا تفيد جوجل، وبريدٌ مكتوب
    // في الكود يبقى معلَناً بعد تغييره من الأدمن — والعمود `orgContactEmail` موجود ومملوء.
    ...(legal.contactEmail && {
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: legal.contactEmail,
          availableLanguage: ["ar", "en"],
        },
      ],
    }),
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
  };
}
