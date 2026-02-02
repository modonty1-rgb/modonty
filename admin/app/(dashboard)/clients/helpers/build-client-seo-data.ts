import type { ClientWithRelations } from "@/lib/types";
import type { ClientForList } from "../actions/clients-actions/types";

type ClientSeoSource = Partial<ClientWithRelations> | ClientForList | null | undefined;

type ClientSeoOverrides = {
  name?: string | null;
  slug?: string | null;
  legalName?: string | null;
  alternateName?: string | null;
  url?: string | null;
  email?: string | null;
  phone?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  description?: string | null;
  businessBrief?: string | null;
  gtmId?: string | null;
  canonicalUrl?: string | null;
  metaRobots?: string | null;
  twitterCard?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterSite?: string | null;
  contactType?: string | null;
  addressStreet?: string | null;
  addressBuildingNumber?: string | null;
  addressAdditionalNumber?: string | null;
  addressNeighborhood?: string | null;
  addressCity?: string | null;
  addressRegion?: string | null;
  addressCountry?: string | null;
  addressPostalCode?: string | null;
  addressLatitude?: number | null;
  addressLongitude?: number | null;
  commercialRegistrationNumber?: string | null;
  vatID?: string | null;
  taxID?: string | null;
  organizationType?: string | null;
  keywords?: string[] | null;
  knowsLanguage?: string[] | null;
  businessActivityCode?: string | null;
  isicV4?: string | null;
  slogan?: string | null;
  numberOfEmployees?: string | null;
  sameAs?: string[] | null;
  contentPriorities?: string[] | null;
  foundingDate?: Date | string | null;
  parentOrganizationId?: string | null;
};

/**
 * Build a normalized SEO data object for SEO Doctor and group scorers.
 * This is the single place where we merge database values with form/list overrides.
 */
export function buildClientSeoData(
  source: ClientSeoSource,
  overrides?: ClientSeoOverrides,
): Record<string, unknown> {
  const base = (source ?? {}) as Record<string, unknown>;
  const o = overrides ?? {};

  const pick = <K extends keyof ClientSeoOverrides>(
    key: K,
  ): ClientSeoOverrides[K] | unknown => {
    if (Object.prototype.hasOwnProperty.call(o, key)) {
      return o[key];
    }
    return base[key as string];
  };

  const rawFoundingDate = pick("foundingDate");
  let normalizedFoundingDate: Date | undefined;
  if (rawFoundingDate instanceof Date) {
    normalizedFoundingDate = rawFoundingDate;
  } else if (typeof rawFoundingDate === "string" && rawFoundingDate.trim().length > 0) {
    const parsed = new Date(rawFoundingDate);
    if (!Number.isNaN(parsed.getTime())) {
      normalizedFoundingDate = parsed;
    }
  }

  const data: Record<string, unknown> = {
    // Start from base so we keep any extra fields used by validators
    ...base,
    name: (pick("name") as string | null) ?? "",
    slug: (pick("slug") as string | null) ?? "",
    legalName: (pick("legalName") as string | null) ?? "",
    alternateName: (pick("alternateName") as string | null) ?? "",
    url: (pick("url") as string | null) ?? "",
    email: (pick("email") as string | null) ?? "",
    phone: (pick("phone") as string | null) ?? "",
    seoTitle: (pick("seoTitle") as string | null) ?? "",
    seoDescription: (pick("seoDescription") as string | null) ?? "",
    description: (pick("description") as string | null) ?? "",
    businessBrief: (pick("businessBrief") as string | null) ?? "",
    gtmId: (pick("gtmId") as string | null) ?? "",
    canonicalUrl: (pick("canonicalUrl") as string | null) ?? "",
    metaRobots: (pick("metaRobots") as string | null) ?? null,
    twitterCard:
      (pick("twitterCard") as string | null | undefined) ??
      (base.twitterCard as string | null | undefined) ??
      null,
    twitterTitle: (pick("twitterTitle") as string | null) ?? "",
    twitterDescription: (pick("twitterDescription") as string | null) ?? "",
    twitterSite: (pick("twitterSite") as string | null) ?? "",
    contactType: (pick("contactType") as string | null) ?? "",
    addressStreet: (pick("addressStreet") as string | null) ?? "",
    addressBuildingNumber: (pick("addressBuildingNumber") as string | null) ?? "",
    addressAdditionalNumber: (pick("addressAdditionalNumber") as string | null) ?? "",
    addressNeighborhood: (pick("addressNeighborhood") as string | null) ?? "",
    addressCity: (pick("addressCity") as string | null) ?? "",
    addressRegion: (pick("addressRegion") as string | null) ?? "",
    addressCountry: (pick("addressCountry") as string | null) ?? "",
    addressPostalCode: (pick("addressPostalCode") as string | null) ?? "",
    addressLatitude:
      (pick("addressLatitude") as number | null | undefined) ??
      ((base as any).addressLatitude ?? null),
    addressLongitude:
      (pick("addressLongitude") as number | null | undefined) ??
      ((base as any).addressLongitude ?? null),
    commercialRegistrationNumber:
      (pick("commercialRegistrationNumber") as string | null) ?? "",
    vatID: (pick("vatID") as string | null) ?? "",
    taxID: (pick("taxID") as string | null) ?? "",
    organizationType: (pick("organizationType") as string | null) ?? "",
    keywords: (pick("keywords") as string[] | null) ?? (base.keywords as string[] | undefined) ?? [],
    knowsLanguage:
      (pick("knowsLanguage") as string[] | null) ??
      ((base.knowsLanguage as string[] | undefined) ?? []),
    businessActivityCode: (pick("businessActivityCode") as string | null) ?? "",
    isicV4: (pick("isicV4") as string | null) ?? "",
    slogan: (pick("slogan") as string | null) ?? "",
    numberOfEmployees: (pick("numberOfEmployees") as string | null) ?? "",
    sameAs:
      (pick("sameAs") as string[] | null) ??
      ((base.sameAs as string[] | undefined) ?? []),
    contentPriorities:
      (pick("contentPriorities") as string[] | null) ??
      ((base.contentPriorities as string[] | undefined) ?? []),
    foundingDate: normalizedFoundingDate,
    parentOrganizationId:
      (pick("parentOrganizationId") as string | null | undefined) ??
      ((base as any).parentOrganizationId ?? null),
    // Media relations are taken from the base client (DB / list) and not overridden by form text fields
    logoMedia: (base as any).logoMedia ?? null,
    ogImageMedia: (base as any).ogImageMedia ?? null,
    twitterImageMedia: (base as any).twitterImageMedia ?? null,
  };

  return data;
}

