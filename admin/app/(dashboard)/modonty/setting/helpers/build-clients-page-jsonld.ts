/**
 * Build Clients page @graph JSON-LD from Settings + clients.
 * Spec: importatn-CLIENTS-PAGE-META-JSONLD-SPEC.md §4, §4a
 */

import type { SettingsForHomeJsonLd } from "./build-home-jsonld-from-settings";

function ensureAbsoluteUrl(url: string | null | undefined, siteUrl: string): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u.replace("http://", "https://");
  if (u.startsWith("/")) return `${siteUrl}${u}`;
  return `https://${u}`;
}

function parseLanguageCodes(raw: string | null | undefined, fallback = "ar"): string | string[] {
  const val = (raw ?? fallback).trim();
  if (!val) return fallback;
  const parts = val
    .split(",")
    .map((p) => (p.trim().split("_")[0] || p.trim()).trim())
    .filter(Boolean);
  const codes = [...new Set(parts)];
  if (codes.length === 0) return fallback;
  if (codes.length === 1) return codes[0];
  return codes;
}

const SCHEMA_CONTEXT = "https://schema.org";

export interface ClientForClientsPageJsonLd {
  name: string;
  slug: string;
  legalName?: string | null;
  alternateName?: string | null;
  description?: string | null;
  seoDescription?: string | null;
  url?: string | null;
  canonicalUrl?: string | null;
  logoMedia?: { url?: string | null } | null;
  ogImageMedia?: { url?: string | null } | null;
  sameAs?: string[];
  email?: string | null;
  phone?: string | null;
  contactType?: string | null;
  addressStreet?: string | null;
  addressCity?: string | null;
  addressRegion?: string | null;
  addressPostalCode?: string | null;
  addressCountry?: string | null;
  addressNeighborhood?: string | null;
  addressBuildingNumber?: string | null;
  addressAdditionalNumber?: string | null;
  addressLatitude?: number | null;
  addressLongitude?: number | null;
  foundingDate?: Date | string | null;
  knowsLanguage?: string[] | null;
  vatID?: string | null;
  taxID?: string | null;
  slogan?: string | null;
  keywords?: string[] | null;
  numberOfEmployees?: string | null;
  parentOrganizationId?: string | null;
  organizationType?: string | null;
  isicV4?: string | null;
  commercialRegistrationNumber?: string | null;
  legalForm?: string | null;
  industry?: { name?: string | null } | null;
  parent?: { slug: string } | null;
  updatedAt?: Date | string | null;
}

export function buildSiteOrgAndWebSite(
  settings: SettingsForHomeJsonLd,
  siteUrl: string
): { org: Record<string, unknown>; website: Record<string, unknown>; inLangCodes: string | string[] } {
  const orgId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const inLangCodes = parseLanguageCodes(settings.inLanguage);
  const availLangCodes = parseLanguageCodes(settings.orgContactAvailableLanguage ?? settings.inLanguage);
  const siteName = settings.siteName?.trim() || "Modonty";
  const logoUrl = (settings.orgLogoUrl ?? settings.logoUrl ?? "").trim();
  const absLogo = logoUrl ? ensureAbsoluteUrl(logoUrl, siteUrl) : undefined;
  const sameAsList: string[] = Array.isArray(settings.sameAs)
    ? settings.sameAs.filter((u): u is string => typeof u === "string" && u.trim().length > 0).map((u) => u.trim())
    : [];

  const org: Record<string, unknown> = {
    "@type": "Organization",
    "@id": orgId,
    name: siteName,
    url: siteUrl,
    description: settings.brandDescription?.trim() ?? "",
    sameAs: sameAsList,
  };
  if (absLogo) org.logo = { "@type": "ImageObject", url: absLogo, width: 512, height: 512 };
  if (
    settings.orgContactType ||
    settings.orgContactEmail ||
    settings.orgContactTelephone ||
    settings.orgAreaServed
  ) {
    org.contactPoint = {
      "@type": "ContactPoint",
      ...(settings.orgContactType && { contactType: settings.orgContactType }),
      ...(settings.orgContactEmail && { email: settings.orgContactEmail }),
      ...(settings.orgContactTelephone && { telephone: settings.orgContactTelephone }),
      ...(settings.orgAreaServed && { areaServed: settings.orgAreaServed }),
      availableLanguage: availLangCodes,
      ...(settings.orgContactOption?.trim() && { contactOption: settings.orgContactOption.trim() }),
      ...(settings.orgContactHoursAvailable?.trim() && { hoursAvailable: settings.orgContactHoursAvailable.trim() }),
    };
  }
  const hasAddress =
    settings.orgStreetAddress ||
    settings.orgAddressLocality ||
    settings.orgAddressCountry;
  const hasGeo =
    settings.orgGeoLatitude != null &&
    settings.orgGeoLongitude != null &&
    !Number.isNaN(settings.orgGeoLatitude) &&
    !Number.isNaN(settings.orgGeoLongitude);
  if (hasAddress || hasGeo) {
    const place: Record<string, unknown> = { "@type": "Place" };
    if (hasAddress) {
      place.address = {
        "@type": "PostalAddress",
        ...(settings.orgStreetAddress && { streetAddress: settings.orgStreetAddress }),
        ...(settings.orgAddressLocality && { addressLocality: settings.orgAddressLocality }),
        ...(settings.orgAddressRegion && { addressRegion: settings.orgAddressRegion }),
        ...(settings.orgPostalCode && { postalCode: settings.orgPostalCode }),
        ...(settings.orgAddressCountry && { addressCountry: settings.orgAddressCountry }),
      };
    }
    if (hasGeo) {
      place.geo = {
        "@type": "GeoCoordinates",
        latitude: settings.orgGeoLatitude,
        longitude: settings.orgGeoLongitude,
      };
    }
    org.location = place;
  }

  const website: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": websiteId,
    name: siteName,
    url: siteUrl,
    description: settings.brandDescription?.trim() ?? "",
    inLanguage: inLangCodes,
    publisher: { "@id": orgId },
  };
  const searchTemplate = settings.orgSearchUrlTemplate?.trim();
  if (searchTemplate) {
    website.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: searchTemplate.includes("{") ? searchTemplate : `${searchTemplate}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    };
  }

  return { org, website, inLangCodes };
}

function clientToOrganization(
  client: ClientForClientsPageJsonLd,
  siteUrl: string,
  index: number
): Record<string, unknown> {
  const profileUrl = `${siteUrl}/clients/${client.slug}`;
  const url = client.canonicalUrl?.trim() || client.url?.trim() || profileUrl;
  const absUrl = ensureAbsoluteUrl(url, siteUrl) || profileUrl;
  const absLogo = client.logoMedia?.url ? ensureAbsoluteUrl(client.logoMedia.url, siteUrl) : undefined;
  const absImage = client.ogImageMedia?.url ? ensureAbsoluteUrl(client.ogImageMedia.url, siteUrl) : undefined;

  const orgType = client.organizationType?.trim() || "Organization";

  const node: Record<string, unknown> = {
    "@type": orgType,
    "@id": profileUrl,
    name: client.name,
    url: absUrl,
    mainEntityOfPage: profileUrl,
  };

  if (client.legalName?.trim()) node.legalName = client.legalName.trim();
  if (client.alternateName?.trim()) node.alternateName = client.alternateName.trim();
  const desc = (client.description ?? client.seoDescription)?.trim();
  if (desc) node.description = desc;

  if (absLogo) {
    node.logo = { "@type": "ImageObject", url: absLogo, width: 512, height: 512 };
  }
  if (absImage) {
    node.image = { "@type": "ImageObject", url: absImage, width: 1200, height: 630 };
  }

  const sameAs = Array.isArray(client.sameAs)
    ? client.sameAs.filter((u): u is string => typeof u === "string" && u.trim().length > 0).map((u) => u.trim())
    : [];
  if (sameAs.length) node.sameAs = sameAs;

  const hasAddr =
    client.addressStreet ||
    client.addressCity ||
    client.addressRegion ||
    client.addressPostalCode ||
    client.addressCountry ||
    client.addressNeighborhood ||
    client.addressBuildingNumber ||
    client.addressAdditionalNumber;
  if (hasAddr) {
    node.address = {
      "@type": "PostalAddress",
      ...(client.addressStreet && { streetAddress: client.addressStreet }),
      ...(client.addressCity && { addressLocality: client.addressCity }),
      ...(client.addressRegion && { addressRegion: client.addressRegion }),
      ...(client.addressPostalCode && { postalCode: client.addressPostalCode }),
      ...(client.addressCountry && { addressCountry: client.addressCountry }),
      ...(client.addressNeighborhood && { addressNeighborhood: client.addressNeighborhood }),
      ...(client.addressBuildingNumber && { addressBuildingNumber: client.addressBuildingNumber }),
      ...(client.addressAdditionalNumber && { addressAdditionalNumber: client.addressAdditionalNumber }),
    };
  }

  if (
    client.addressLatitude != null &&
    client.addressLongitude != null &&
    !Number.isNaN(client.addressLatitude) &&
    !Number.isNaN(client.addressLongitude)
  ) {
    node.location = {
      "@type": "Place",
      geo: {
        "@type": "GeoCoordinates",
        latitude: client.addressLatitude,
        longitude: client.addressLongitude,
      },
    };
  }

  if (client.email?.trim() || client.phone?.trim() || client.contactType?.trim()) {
    node.contactPoint = {
      "@type": "ContactPoint",
      ...(client.email?.trim() && { email: client.email.trim() }),
      ...(client.phone?.trim() && { telephone: client.phone.trim() }),
      ...(client.contactType?.trim() && { contactType: client.contactType.trim() }),
      areaServed: "SA",
    };
  }

  if (client.foundingDate) {
    const d = client.foundingDate instanceof Date ? client.foundingDate : new Date(client.foundingDate);
    if (!Number.isNaN(d.getTime())) node.foundingDate = d.toISOString().split("T")[0];
  }
  if (client.knowsLanguage?.length) node.knowsLanguage = client.knowsLanguage;
  if (client.vatID?.trim()) node.vatID = client.vatID.trim();
  if (client.taxID?.trim()) node.taxID = client.taxID.trim();
  if (client.slogan?.trim()) node.slogan = client.slogan.trim();
  const kw = Array.isArray(client.keywords)
    ? client.keywords.filter((k): k is string => typeof k === "string" && k.trim().length > 0)
    : [];
  if (kw.length) node.keywords = kw.join(", ");
  if (client.numberOfEmployees?.trim()) {
    node.numberOfEmployees = {
      "@type": "QuantitativeValue",
      value: parseInt(client.numberOfEmployees, 10) || client.numberOfEmployees,
    };
  }
  if (client.parent?.slug) {
    node.parentOrganization = { "@id": `${siteUrl}/clients/${client.parent.slug}` };
  }
  if (client.isicV4?.trim()) node.isicV4 = client.isicV4.trim();
  if (client.commercialRegistrationNumber?.trim()) {
    node.identifier = client.commercialRegistrationNumber.trim();
  }
  if (client.industry?.name?.trim()) node.knowsAbout = client.industry.name.trim();

  return {
    "@type": "ListItem",
    position: index + 1,
    item: node,
  };
}

export function buildClientsPageJsonLd(
  settings: SettingsForHomeJsonLd,
  clients: ClientForClientsPageJsonLd[],
  totalCount: number,
  dateModified: Date
): object {
  const siteUrl = (settings.siteUrl?.trim() || "https://modonty.com").replace(/\/$/, "");
  const pageUrl = `${siteUrl}/clients`;
  const { org, website, inLangCodes } = buildSiteOrgAndWebSite(settings, siteUrl);

  const name =
    settings.clientsSeoTitle?.trim() || "العملاء - دليل الشركات والمؤسسات";
  const description =
    settings.clientsSeoDescription?.trim() || "استكشف دليل شامل للشركات والمؤسسات الرائدة.";
  const ogImageUrl = (settings.ogImageUrl ?? settings.logoUrl ?? "").trim();
  const absOgImage = ogImageUrl ? ensureAbsoluteUrl(ogImageUrl, siteUrl) : undefined;

  const itemListElements = clients.slice(0, 20).map((c, i) => clientToOrganization(c, siteUrl, i));

  const itemList: Record<string, unknown> = {
    "@type": "ItemList",
    itemListOrder: "ItemListOrderAscending",
    numberOfItems: totalCount,
    itemListElement: itemListElements,
  };

  const collectionPage: Record<string, unknown> = {
    "@type": "CollectionPage",
    "@id": `${pageUrl}#collectionpage`,
    name,
    url: pageUrl,
    description,
    inLanguage: inLangCodes,
    isPartOf: { "@id": `${siteUrl}/#website` },
    dateModified: dateModified.toISOString(),
    mainEntity: itemList,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, item: { "@id": siteUrl, name: "الرئيسية" } },
        { "@type": "ListItem", position: 2, item: { "@id": pageUrl, name } },
      ],
    },
  };
  if (absOgImage) {
    collectionPage.primaryImageOfPage = {
      "@type": "ImageObject",
      url: absOgImage,
      width: 1200,
      height: 630,
    };
  }

  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [org, website, collectionPage],
  };
}
