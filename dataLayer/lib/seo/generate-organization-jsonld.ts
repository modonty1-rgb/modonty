import { Client } from "@prisma/client";
import { safeOrganizationType, resolveOrganizationType, isLocalFamilyType } from "./organization-schema-types";
import { YMYL_CATEGORIES, isYmylCategory } from "./ymyl-config";
import {
  buildImageObject,
  resolveImageAttribution,
  type ModontyImageDefaults,
} from "./media/build-image-object";

/**
 * The most specific schema.org type we can justify for this client from what we KNOW
 * about it, ignoring whatever type someone typed into the record. Returns null when we
 * can work out nothing.
 *
 * ONE source today (YMYL: specialty → Dentist, category → MedicalClinic / LegalService /
 * FinancialService). Add a source below — an industry map giving FurnitureStore,
 * OnlineStore, … — and every card on the platform picks it up, because this runs INSIDE
 * the card builder, not in one of its callers.
 */
function deriveClientType(client: {
  isYmyl?: boolean | null;
  ymylCategory?: string | null;
  ymylData?: unknown;
}): string | null {
  if (client.isYmyl && isYmylCategory(client.ymylCategory)) {
    const cfg = YMYL_CATEGORIES[client.ymylCategory];
    const specialty = (client.ymylData as Record<string, unknown> | null)?.specialty;

    if (typeof specialty === "string") {
      const field = cfg.fields.find((f) => f.type === "specialty");
      const match = field?.specialties?.find((s) => s.value === specialty);
      if (match?.schemaSubType) return match.schemaSubType;
    }

    return cfg.schemaType;
  }

  // Source 2 — (industry map: FurnitureStore, OnlineStore, …) — add here.

  return null;
}

interface ClientWithMedia extends Omit<Client, "contentPriorities"> {
  logoMedia?: {
    url: string;
    width: number | null;
    height: number | null;
    altText: string | null;
    description?: string | null;
    createdAt?: Date | string | null;
  } | null;
  heroImageMedia?: {
    url: string;
    width: number | null;
    height: number | null;
    altText: string | null;
    description?: string | null;
    createdAt?: Date | string | null;
  } | null;
  industry?: {
    id: string;
    name: string;
  } | null;
  contentPriorities?: string[];
  parentOrganization?: {
    name: string;
    id?: string;
    url?: string;
    slug?: string;
  } | null;
}

interface JsonLdNode {
  "@type": string;
  "@id"?: string;
  [key: string]: unknown;
}

interface JsonLdGraph {
  "@context": string;
  "@graph": JsonLdNode[];
}

// Helper function to ensure absolute HTTPS URLs
function ensureAbsoluteUrl(url: string | null | undefined, siteUrl: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url.replace("http://", "https://");
  }
  if (url.startsWith("/")) {
    return `${siteUrl}${url}`;
  }
  return `https://${url}`;
}

// Helper function to validate URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Helper function to map language names to ISO 639-1 codes
function mapLanguageToCode(lang: string): string {
  const langLower = lang.toLowerCase();
  if (langLower.includes("arabic") || langLower.includes("ar") || langLower === "ar") return "ar";
  if (langLower.includes("english") || langLower.includes("en") || langLower === "en") return "en";
  return lang; // Return as-is if already a code
}

// geo / hasMap / openingHoursSpecification / priceRange are Place properties — valid ONLY
// on types that descend from LocalBusiness → Place. Emitting them on a plain Organization
// is an UNKNOWN_FIELD in Google's and schema.org's validators.
//
// The list lives in organization-schema-types.ts and is imported, never re-typed: the copy
// that used to sit here had already drifted (no Optician), so an eye clinic could be given
// the medical type and then denied the address and hours that type exists to carry.
const isLocalBusinessType = isLocalFamilyType;

// Helper function to get country code from country name
function getCountryCode(country: string | null | undefined): string {
  if (!country) return "SA"; // Default to Saudi Arabia
  const countryUpper = country.toUpperCase();
  // Map common country names to ISO 3166-1 alpha-2 codes
  if (countryUpper.includes("SAUDI") || countryUpper === "SA") return "SA";
  if (countryUpper.includes("UAE") || countryUpper === "AE") return "AE";
  if (countryUpper.includes("KUWAIT") || countryUpper === "KW") return "KW";
  if (countryUpper.includes("QATAR") || countryUpper === "QA") return "QA";
  if (countryUpper.includes("BAHRAIN") || countryUpper === "BH") return "BH";
  if (countryUpper.includes("OMAN") || countryUpper === "OM") return "OM";
  // If already a 2-letter code, return it
  if (countryUpper.length === 2) return countryUpper;
  return "SA"; // Default
}

export function generateCompleteOrganizationJsonLd(
  client: ClientWithMedia & {
    createdAt: Date;
    updatedAt: Date;
  },
  clientPageUrl: string,
  options?: {
    siteUrl?: string;
    siteName?: string;
    // Customer reviews of this organization (ClientReview, APPROVED only).
    aggregateRating?: { ratingValue: number; reviewCount: number };
    reviews?: Array<{
      author: string;
      rating: number;
      body: string;
      datePublished: string; // ISO 8601
    }>;
    // Client-page gallery (Media type=GALLERY, scope=CLIENT) → Organization.image[].
    galleryImages?: Array<{
      url: string;
      altText?: string | null;
      width?: number | null;
      height?: number | null;
      description?: string | null;
      createdAt?: Date | string | null;
    }>;
    // Modonty image-licensing defaults (Settings) → Google Licensable badge.
    // Absent → images carry no licence block (same as before this feature).
    imageLicensing?: ModontyImageDefaults;
  }
): JsonLdGraph {
  // Caller MUST pass options.siteUrl (loaded from loadSiteUrl()). Hardcoded fallback only as a safety net.
  const siteUrl = options?.siteUrl || "https://www.modonty.com";
  const siteName = options?.siteName || "Modonty";
  const imageLicensing: ModontyImageDefaults = {
    organizationUrl: siteUrl,
    ...(options?.imageLicensing ?? {}),
  };
  const graph: JsonLdNode[] = [];

  // Ensure clientPageUrl is absolute
  const absoluteClientPageUrl = ensureAbsoluteUrl(clientPageUrl, siteUrl) || clientPageUrl;

  const organizationId = `${siteUrl}/clients/${client.slug}#organization`;
  const websiteId = `${siteUrl}#website`;
  const webPageId = absoluteClientPageUrl;

  // The ONE decision about what this client IS — made here, inside the builder, so every
  // path that produces a card gets it: the shared bundle, the admin cascade, and anything
  // written next. Putting it in a caller (as it first was) let the cascade rebuild cards
  // that still said "Corporation" for a clinic (caught on production 2026-07-14, before
  // the cascade ran).
  //
  // Google's rule, applied verbatim: "Use the most specific LocalBusiness sub-type
  // possible." A container type (Organization / LocalBusiness) names no business at all,
  // and Corporation / NGO sit OUTSIDE the LocalBusiness family — no address, no hours,
  // no local result. Either loses to a type we can actually derive.
  const effectiveType = resolveOrganizationType(client.organizationType, deriveClientType(client));

  const organizationNode: JsonLdNode = {
    "@type": safeOrganizationType(effectiveType),
    "@id": organizationId,
    name: client.name,
  };

  // Basic properties
  if (client.legalName) {
    organizationNode.legalName = client.legalName;
  }
  if (client.alternateName) {
    organizationNode.alternateName = client.alternateName;
  }
  if (client.slogan) {
    organizationNode.slogan = client.slogan;
  }

  // Ensure URL is absolute and HTTPS
  if (client.url) {
    organizationNode.url = ensureAbsoluteUrl(client.url, siteUrl) || client.url;
  } else {
    organizationNode.url = `${siteUrl}/clients/${client.slug}`;
  }

  // Logo as ImageObject with validation (minimum 112x112 per Google guidelines)
  if (client.logoMedia?.url) {
    const logoUrl = ensureAbsoluteUrl(client.logoMedia.url, siteUrl) || client.logoMedia.url;
    const logoWidth = client.logoMedia.width && client.logoMedia.width >= 112 ? client.logoMedia.width : 112;
    const logoHeight = client.logoMedia.height && client.logoMedia.height >= 112 ? client.logoMedia.height : 112;
    
    const logoAttr = resolveImageAttribution(
      {
        mediaType: "LOGO",
        clientName: client.name,
        clientUrl: absoluteClientPageUrl,
        altText: client.logoMedia.altText,
        dateCreated: client.logoMedia.createdAt,
      },
      imageLicensing,
    );
    organizationNode.logo = buildImageObject({
      url: logoUrl,
      width: logoWidth,
      height: logoHeight,
      name: logoAttr.name,
      caption: client.logoMedia.altText,
      description: client.logoMedia.description,
      licensing: logoAttr.licensing,
    });
  }

  // Description
  if (client.description) {
    organizationNode.description = client.description;
  } else if (client.seoDescription) {
    organizationNode.description = client.seoDescription;
  }

  // Founding date
  if (client.foundingDate) {
    organizationNode.foundingDate = client.foundingDate.toISOString().split("T")[0];
  }

  // Knows language (IETF BCP 47 per Schema.org)
  if (Array.isArray(client.knowsLanguage) && client.knowsLanguage.length > 0) {
    organizationNode.knowsLanguage = client.knowsLanguage.map(mapLanguageToCode);
  }

  // Saudi Arabia & Gulf Identifiers with ISO6523Code support
  const identifiers: Array<Record<string, unknown>> = [];
  if (client.commercialRegistrationNumber) {
    identifiers.push({
      "@type": "PropertyValue",
      name: "Commercial Registration Number",
      value: client.commercialRegistrationNumber,
    });

    const countryCode = getCountryCode(client.addressCountry);
    identifiers.push({
      "@type": "PropertyValue",
      name: "ISO6523Code",
      value: `0199:${countryCode}${client.commercialRegistrationNumber}`,
    });
  }
  if (identifiers.length > 0) {
    organizationNode.identifier = identifiers;
  }

  // companyRegistration (Schema.org Certification) when CR exists
  if (client.commercialRegistrationNumber) {
    // (Issuer formerly read from Client.licenseAuthority — that column was removed when YMYL data moved into Client.ymylData JSON.)
    const issuer = "Ministry of Commerce";
    organizationNode.companyRegistration = {
      "@type": "Certification",
      name: "Commercial Registration",
      certificationIdentification: client.commercialRegistrationNumber,
      issuedBy: { "@type": "Organization", name: issuer },
    };
  }
  if (client.vatID) {
    organizationNode.vatID = client.vatID;
  }
  if (client.taxID) {
    organizationNode.taxID = client.taxID;
  }

  // Contact points (array support) with proper ISO codes
  const contactPoints: unknown[] = [];
  if (client.email || client.phone) {
    const contactPoint: Record<string, unknown> = {
      "@type": "ContactPoint",
    };
    if (client.contactType) {
      contactPoint.contactType = client.contactType;
    } else if (client.email && client.phone) {
      contactPoint.contactType = "customer service";
    }
    if (client.email) {
      contactPoint.email = client.email;
    }
    if (client.phone) {
      contactPoint.telephone = client.phone;
    }
    
    // Use ISO 3166-1 alpha-2 country code for areaServed
    const countryCode = getCountryCode(client.addressCountry);
    contactPoint.areaServed = countryCode;
    
    // Map languages to ISO 639-1 codes
    const availableLanguages = Array.isArray(client.knowsLanguage) && client.knowsLanguage.length > 0
      ? client.knowsLanguage.map(mapLanguageToCode)
      : ["ar", "en"];
    contactPoint.availableLanguage = availableLanguages;
    
    contactPoints.push(contactPoint);
  }

  if (contactPoints.length > 0) {
    organizationNode.contactPoint = contactPoints.length === 1 ? contactPoints[0] : contactPoints;
  }
  
  // Add areaServed at Organization level if applicable
  if (client.addressCountry) {
    organizationNode.areaServed = getCountryCode(client.addressCountry);
  }

  // Enhanced Address (National Address Format) with building number in streetAddress
  if (
    client.addressStreet ||
    client.addressCity ||
    client.addressCountry ||
    client.addressRegion ||
    client.addressNeighborhood ||
    client.addressBuildingNumber ||
    client.addressPostalCode
  ) {
    const address: Record<string, unknown> = {
      "@type": "PostalAddress",
    };
    
    // Combine street address with building number for better formatting
    let streetAddress = client.addressStreet || "";
    if (client.addressBuildingNumber) {
      if (streetAddress) {
        streetAddress = `${streetAddress}, Building ${client.addressBuildingNumber}`;
      } else {
        streetAddress = `Building ${client.addressBuildingNumber}`;
      }
      if (client.addressAdditionalNumber) {
        streetAddress += `, Additional ${client.addressAdditionalNumber}`;
      }
    }
    if (streetAddress) {
      address.streetAddress = streetAddress;
    }
    
    if (client.addressNeighborhood) {
      address.addressNeighborhood = client.addressNeighborhood;
    }
    if (client.addressCity) {
      address.addressLocality = client.addressCity;
    }
    if (client.addressRegion) {
      address.addressRegion = client.addressRegion;
    }
    if (client.addressCountry) {
      // Use ISO 3166-1 alpha-2 country code
      address.addressCountry = getCountryCode(client.addressCountry);
    }
    if (client.addressPostalCode) {
      address.postalCode = client.addressPostalCode;
    }
    
    organizationNode.address = address;
    
    // If we have separate legal address fields in the future, add legalAddress here
    // For now, physical address is used for both
  }

  // Classification
  if (client.isicV4) {
    organizationNode.isicV4 = client.isicV4;
  }
  if (client.businessActivityCode) {
    organizationNode.businessActivityCode = client.businessActivityCode;
  }

  // Place-only properties (geo, openingHours, priceRange, hasMap) are valid ONLY on
  // LocalBusiness sub-types per schema.org. Emitting them on a plain `Organization`
  // is an UNKNOWN_FIELD warning in Google/schema.org validators, so gate the whole
  // block. The GBP Place-ID link still rides in `sameAs` for non-local types.
  const lat = client.addressLatitude;
  const lng = client.addressLongitude;
  // Gate on the EFFECTIVE type, not the stored one: a clinic whose record says
  // "Corporation" is a place people walk into, and once its card is typed Dentist it must
  // carry the geo/hours block too. Reading the raw column here would hand it the medical
  // type and then withhold the address that type exists to carry.
  const isLocalBusiness = isLocalBusinessType(effectiveType);
  // GBP Place ID — used for hasMap (LocalBusiness only) AND for the sameAs Maps
  // link (any type). Declared at function scope so the sameAs block below can read it.
  const placeId = client.gbpPlaceId?.trim();

  if (isLocalBusiness) {
    // GeoCoordinates when lat/long exist
    if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
      organizationNode.geo = { "@type": "GeoCoordinates", latitude: lat, longitude: lng };
    }

    // OpeningHoursSpecification (Google recommends for LocalBusiness)
    // schema.org/OpeningHoursSpecification — stored as JSON array in Prisma
    if (client.openingHoursSpecification) {
      try {
        const hours = typeof client.openingHoursSpecification === "string"
          ? JSON.parse(client.openingHoursSpecification)
          : client.openingHoursSpecification;
        if (Array.isArray(hours) && hours.length > 0) {
          organizationNode.openingHoursSpecification = hours.map((h: Record<string, unknown>) => {
            const spec: Record<string, unknown> = { "@type": "OpeningHoursSpecification" };
            if (h.dayOfWeek) spec.dayOfWeek = h.dayOfWeek;
            if (h.opens) spec.opens = h.opens;
            if (h.closes) spec.closes = h.closes;
            if (h.validFrom) spec.validFrom = h.validFrom;
            if (h.validThrough) spec.validThrough = h.validThrough;
            return spec;
          });
        }
      } catch { /* Invalid JSON — skip */ }
    }

    // Price range (Google recommends for LocalBusiness)
    if (client.priceRange) {
      organizationNode.priceRange = client.priceRange;
    }

    // hasMap — schema.org/hasMap (Place/LocalBusiness). A Google Business Profile
    // Place ID is the most precise link to the exact listing, so prefer it; fall
    // back to raw geo coordinates. Official Maps URL scheme:
    // https://developers.google.com/maps/documentation/urls/get-started#search-action
    if (placeId) {
      organizationNode.hasMap = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        client.name
      )}&query_place_id=${encodeURIComponent(placeId)}`;
    } else if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
      organizationNode.hasMap = `https://www.google.com/maps?q=${lat},${lng}`;
    }
  }

  // Number of employees as QuantitativeValue
  if (client.numberOfEmployees) {
    const empRaw = client.numberOfEmployees.trim();

    // "100+" format — minValue only
    if (/^\d[\d,]*\+$/.test(empRaw.replace(/\s/g, ""))) {
      const minVal = parseInt(empRaw.replace(/\D/g, ""));
      if (!isNaN(minVal)) {
        organizationNode.numberOfEmployees = {
          "@type": "QuantitativeValue",
          minValue: minVal,
        };
      }
    } else if (empRaw.includes("-")) {
      // Range: "10-50", "1,000-5,000", "50-99 employees"
      const parts = empRaw.split("-");
      let min = parseInt(parts[0].replace(/\D/g, ""));
      let max = parseInt(parts[1].replace(/\D/g, ""));
      if (!isNaN(min) && !isNaN(max)) {
        if (min > max) { [min, max] = [max, min]; }
        organizationNode.numberOfEmployees = {
          "@type": "QuantitativeValue",
          minValue: min,
          maxValue: max,
        };
      }
    } else {
      const numValue = parseInt(empRaw.replace(/\D/g, ""));
      if (!isNaN(numValue)) {
        organizationNode.numberOfEmployees = {
          "@type": "QuantitativeValue",
          value: numValue,
        };
      }
    }
  }

  // Parent organization relationship (@id = resolvable URL per Schema.org)
  if (client.parentOrganization) {
    const parent = client.parentOrganization;
    let parentId: string | undefined;
    if (parent.slug) {
      parentId = `${siteUrl}/clients/${parent.slug}#organization`;
    } else if (parent.url) {
      parentId = ensureAbsoluteUrl(parent.url, siteUrl);
    }
    organizationNode.parentOrganization = {
      "@type": "Organization",
      name: parent.name,
      ...(parentId && { "@id": parentId }),
      ...(parent.url && { url: ensureAbsoluteUrl(parent.url, siteUrl) || parent.url }),
    };
  }

  // Social profiles with URL validation
  if (client.sameAs && client.sameAs.length > 0) {
    // Filter and validate URLs, ensure HTTPS
    const validSameAsUrls = client.sameAs
      .filter(url => url && isValidUrl(url))
      .map(url => ensureAbsoluteUrl(url, siteUrl) || url);
    
    if (validSameAsUrls.length > 0) {
      organizationNode.sameAs = validSameAsUrls;
    }
  }

  // GBP links → appended to sameAs (no dedicated schema.org property; sameAs is
  // the recommended way to reference an authoritative listing of the entity).
  // Add the Place-ID Maps URL (most precise) + the profile URL when present.
  const pushSameAs = (raw: string | null | undefined) => {
    if (!raw) return;
    const u = ensureAbsoluteUrl(raw, siteUrl);
    if (!u) return;
    if (Array.isArray(organizationNode.sameAs)) {
      if (!organizationNode.sameAs.includes(u)) organizationNode.sameAs.push(u);
    } else {
      organizationNode.sameAs = [u];
    }
  };
  if (placeId) {
    pushSameAs(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        client.name
      )}&query_place_id=${encodeURIComponent(placeId)}`
    );
  }
  pushSameAs(client.gbpProfileUrl);

  organizationNode.mainEntityOfPage = {
    "@type": "WebPage",
    "@id": webPageId,
  };

  // Keywords (from contentPriorities or keywords field)
  if (Array.isArray(client.keywords) && client.keywords.length > 0) {
    organizationNode.keywords = client.keywords;
  } else if (client.contentPriorities && client.contentPriorities.length > 0) {
    organizationNode.keywords = client.contentPriorities;
  }

  // Enhanced knowsAbout - include industry name and content priorities
  const knowsAbout: string[] = [];
  if (client.industry?.name) {
    knowsAbout.push(client.industry.name);
  }
  if (client.contentPriorities && client.contentPriorities.length > 0) {
    knowsAbout.push(...client.contentPriorities);
  }
  if (Array.isArray(client.keywords) && client.keywords.length > 0) {
    // Add keywords that aren't already in knowsAbout
    client.keywords.forEach(kw => {
      if (!knowsAbout.includes(kw)) {
        knowsAbout.push(kw);
      }
    });
  }
  if (knowsAbout.length > 0) {
    organizationNode.knowsAbout = knowsAbout;
  }

  // ===== Client-page presentation (mini-site) → JSON-LD =====
  // Services → OfferCatalog. Each service becomes an Offer wrapping a Service.
  if (Array.isArray(client.services) && client.services.length > 0) {
    organizationNode.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: `خدمات ${client.name}`,
      itemListElement: client.services.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.title,
          ...(s.description ? { description: s.description } : {}),
        },
      })),
    };
  }

  // Team members → employee: Person[]
  if (Array.isArray(client.teamMembers) && client.teamMembers.length > 0) {
    organizationNode.employee = client.teamMembers.map((m) => {
      const person: JsonLdNode = { "@type": "Person", name: m.name };
      if (m.role) person.jobTitle = m.role;
      const img = ensureAbsoluteUrl(m.photoUrl, siteUrl);
      if (img) person.image = img;
      return person;
    });
  }

  // Credentials → hasCredential: EducationalOccupationalCredential[]
  if (Array.isArray(client.credentials) && client.credentials.length > 0) {
    organizationNode.hasCredential = client.credentials.map((c) => {
      const cred: JsonLdNode = {
        "@type": "EducationalOccupationalCredential",
        name: c.name,
      };
      if (c.authority) cred.recognizedBy = { "@type": "Organization", name: c.authority };
      if (c.year) cred.dateCreated = c.year;
      const url = ensureAbsoluteUrl(c.url, siteUrl);
      if (url) cred.url = url;
      return cred;
    });
  }
  // Gallery → image: ImageObject[] (client-page gallery, Media type=GALLERY).
  // schema.org/Organization supports `image`; ImageObject (vs bare URL) lets us
  // carry dimensions + caption for Google image search.
  if (Array.isArray(options?.galleryImages) && options.galleryImages.length > 0) {
    const galleryNodes = options.galleryImages
      .map((g, i) => {
        const u = ensureAbsoluteUrl(g.url, siteUrl);
        if (!u) return null;
        const attr = resolveImageAttribution(
          {
            mediaType: "GALLERY",
            clientName: client.name,
            clientUrl: absoluteClientPageUrl,
            galleryIndex: i + 1,
            altText: g.altText,
            dateCreated: g.createdAt,
          },
          imageLicensing,
        );
        return buildImageObject({
          url: u,
          width: g.width,
          height: g.height,
          name: attr.name,
          caption: g.altText,
          description: g.description,
          licensing: attr.licensing,
        });
      })
      .filter((n) => n !== null);
    if (galleryNodes.length > 0) {
      organizationNode.image = galleryNodes;
    }
  }

  // NOTE: introVideoUrl → VideoObject is intentionally NOT emitted yet — a valid
  // VideoObject needs name + description + thumbnailUrl + uploadDate to avoid a
  // Google "missing field" warning. Revisit once that metadata is captured.

  // Customer reviews of this organization (ClientReview, APPROVED). Hosted on
  // Modonty (third-party platform, not the client's own site) → eligible for the
  // review rich result. bestRating/worstRating explicit per Google guidelines.
  if (options?.aggregateRating && options.aggregateRating.reviewCount > 0) {
    organizationNode.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Math.round(options.aggregateRating.ratingValue * 10) / 10,
      reviewCount: options.aggregateRating.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (options?.reviews && options.reviews.length > 0) {
    organizationNode.review = options.reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: r.body,
      datePublished: r.datePublished,
    }));
  }

  graph.push(organizationNode);

  const websiteNode: JsonLdNode = {
    "@type": "WebSite",
    "@id": websiteId,
    url: siteUrl,
    name: siteName,
    publisher: {
      "@id": organizationId,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  graph.push(websiteNode);

  const webPageNode: JsonLdNode = {
    "@type": "WebPage",
    "@id": webPageId,
    url: absoluteClientPageUrl,
    name: client.seoTitle || client.name,
    description: client.seoDescription || client.description || undefined,
    isPartOf: {
      "@id": websiteId,
    },
    about: {
      "@id": organizationId,
    },
    // Use proper language code from knowsLanguage
    inLanguage: Array.isArray(client.knowsLanguage) && client.knowsLanguage.length > 0
      ? mapLanguageToCode(client.knowsLanguage[0])
      : "ar",
    datePublished: client.createdAt.toISOString(),
    dateModified: client.updatedAt.toISOString(),
  };

  // primaryImageOfPage: only use hero image (proper page image)
  // Logo is NOT suitable as primaryImageOfPage — it's a brand mark, not page content
  // This property is optional per Schema.org — omit if no hero image exists
  const ogImg = client.heroImageMedia;
  if (ogImg?.url) {
    const u = ensureAbsoluteUrl(ogImg.url, siteUrl) || ogImg.url;
    const heroAttr = resolveImageAttribution(
      {
        mediaType: "HERO",
        clientName: client.name,
        clientUrl: absoluteClientPageUrl,
        altText: ogImg.altText,
        dateCreated: ogImg.createdAt,
      },
      imageLicensing,
    );
    webPageNode.primaryImageOfPage = buildImageObject({
      url: u,
      width: ogImg.width,
      height: ogImg.height,
      name: heroAttr.name,
      caption: ogImg.altText,
      description: ogImg.description,
      licensing: heroAttr.licensing,
    });
  }

  graph.push(webPageNode);

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
