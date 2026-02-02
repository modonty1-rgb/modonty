import { Client } from "@prisma/client";

interface ClientWithMedia extends Omit<Client, "contentPriorities"> {
  logoMedia?: {
    url: string;
    width: number | null;
    height: number | null;
    altText: string | null;
  } | null;
  ogImageMedia?: {
    url: string;
    width: number | null;
    height: number | null;
    altText: string | null;
  } | null;
  twitterImageMedia?: {
    url: string;
    width: number | null;
    height: number | null;
    altText: string | null;
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
  clientPageUrl: string
): JsonLdGraph {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
  const graph: JsonLdNode[] = [];

  // Ensure clientPageUrl is absolute
  const absoluteClientPageUrl = ensureAbsoluteUrl(clientPageUrl, siteUrl) || clientPageUrl;

  const organizationId = `${siteUrl}/clients/${client.slug}#organization`;
  const websiteId = `${siteUrl}#website`;
  const webPageId = absoluteClientPageUrl;

  const organizationNode: JsonLdNode = {
    "@type": (client.organizationType as string) || "Organization",
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
    
    organizationNode.logo = {
      "@type": "ImageObject",
      url: logoUrl,
      contentUrl: logoUrl,
      width: logoWidth,
      height: logoHeight,
      ...(client.logoMedia.altText && { caption: client.logoMedia.altText }),
    };
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
    const issuer = client.licenseAuthority?.trim() || "Ministry of Commerce";
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

  // GeoCoordinates when lat/long exist
  const lat = client.addressLatitude;
  const lng = client.addressLongitude;
  if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
    organizationNode.geo = { "@type": "GeoCoordinates", latitude: lat, longitude: lng };
  }

  // Number of employees as QuantitativeValue
  if (client.numberOfEmployees) {
    const empValue = client.numberOfEmployees;
    if (empValue.includes("-")) {
      const [min, max] = empValue.split("-").map((v) => parseInt(v.trim()));
      if (!isNaN(min) && !isNaN(max)) {
        organizationNode.numberOfEmployees = {
          "@type": "QuantitativeValue",
          minValue: min,
          maxValue: max,
        };
      }
    } else {
      const numValue = parseInt(empValue);
      if (!isNaN(numValue)) {
        organizationNode.numberOfEmployees = {
          "@type": "QuantitativeValue",
          value: numValue,
        };
      } else {
        organizationNode.numberOfEmployees = {
          "@type": "QuantitativeValue",
          value: empValue,
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

  graph.push(organizationNode);

  const websiteNode: JsonLdNode = {
    "@type": "WebSite",
    "@id": websiteId,
    url: siteUrl,
    name: "Modonty",
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

  // primaryImageOfPage: OG image, else logo fallback (per JSON-LD research)
  const ogImg = client.ogImageMedia;
  const logoImg = client.logoMedia;
  if (ogImg?.url) {
    const u = ensureAbsoluteUrl(ogImg.url, siteUrl) || ogImg.url;
    const w = ogImg.width && ogImg.width >= 1200 ? ogImg.width : 1200;
    const h = ogImg.height && ogImg.height >= 630 ? ogImg.height : 630;
    webPageNode.primaryImageOfPage = {
      "@type": "ImageObject",
      url: u,
      contentUrl: u,
      width: w,
      height: h,
      ...(ogImg.altText && { caption: ogImg.altText }),
    };
  } else if (logoImg?.url) {
    const u = ensureAbsoluteUrl(logoImg.url, siteUrl) || logoImg.url;
    const w = logoImg.width && logoImg.width >= 112 ? logoImg.width : 112;
    const h = logoImg.height && logoImg.height >= 112 ? logoImg.height : 112;
    webPageNode.primaryImageOfPage = {
      "@type": "ImageObject",
      url: u,
      contentUrl: u,
      width: w,
      height: h,
      ...(logoImg.altText && { caption: logoImg.altText }),
    };
  }

  graph.push(webPageNode);

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
