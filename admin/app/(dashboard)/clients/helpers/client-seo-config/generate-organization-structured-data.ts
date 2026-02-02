import type { SEOFieldValidator } from "@/components/shared/seo-doctor";
import type { MediaRelation } from "./media-relation";

export function generateOrganizationStructuredData(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": (data.organizationType as string) || "Organization",
    name: (data.name as string) || undefined,
  };

  // Basic properties
  if (data.legalName) structuredData.legalName = data.legalName as string;
  if (data.alternateName) structuredData.alternateName = data.alternateName as string;
  if (data.url) structuredData.url = data.url as string;
  if (data.slogan) structuredData.slogan = data.slogan as string;

  // Logo as ImageObject with dimensions
  const logoMedia = data.logoMedia as MediaRelation;
  if (logoMedia?.url) {
    structuredData.logo = {
      "@type": "ImageObject",
      url: logoMedia.url as string,
      ...(logoMedia.width && { width: logoMedia.width }),
      ...(logoMedia.height && { height: logoMedia.height }),
    };
  }

  // Description
  if (data.description) {
    structuredData.description = data.description as string;
  } else if (data.seoDescription) {
    structuredData.description = data.seoDescription as string;
  }

  // Keywords
  if (Array.isArray(data.keywords) && data.keywords.length > 0) {
    structuredData.keywords = data.keywords;
  }

  // Founding date
  if (data.foundingDate) {
    const dateValue = data.foundingDate;
    structuredData.foundingDate =
      typeof dateValue === "string"
        ? dateValue.split("T")[0]
        : dateValue instanceof Date
          ? dateValue.toISOString().split("T")[0]
          : undefined;
  }

  // Knows language
  if (Array.isArray(data.knowsLanguage) && data.knowsLanguage.length > 0) {
    structuredData.knowsLanguage = data.knowsLanguage;
  }

  // Saudi Arabia & Gulf Identifiers
  const identifiers: Array<Record<string, unknown>> = [];
  if (data.commercialRegistrationNumber) {
    identifiers.push({
      "@type": "PropertyValue",
      name: "Commercial Registration Number",
      value: data.commercialRegistrationNumber as string,
    });
  }
  if (data.vatID) {
    structuredData.vatID = data.vatID as string;
    // Use VAT ID as Tax ID since they are equal
    structuredData.taxID = data.vatID as string;
  } else if (data.taxID) {
    // Fallback to Tax ID if VAT ID is not provided
    structuredData.taxID = data.taxID as string;
  }
  if (identifiers.length > 0) {
    structuredData.identifier = identifiers;
  }

  // Contact Points (array support)
  const contactPoints: Array<Record<string, unknown>> = [];
  if (data.email || data.phone) {
    const contactPoint: Record<string, unknown> = {
      "@type": "ContactPoint",
    };
    if (data.contactType) {
      contactPoint.contactType = data.contactType as string;
    } else if (data.email && data.phone) {
      contactPoint.contactType = "customer service";
    }
    if (data.email) contactPoint.email = data.email as string;
    if (data.phone) contactPoint.telephone = data.phone as string;
    
    // Area served and available language
    if (data.addressCountry) {
      contactPoint.areaServed = data.addressCountry as string;
    } else {
      contactPoint.areaServed = "SA"; // Default to Saudi Arabia
    }
    
    // Available languages
    if (Array.isArray(data.knowsLanguage) && data.knowsLanguage.length > 0) {
      contactPoint.availableLanguage = data.knowsLanguage;
    } else {
      contactPoint.availableLanguage = ["Arabic", "English"];
    }
    
    contactPoints.push(contactPoint);
  }
  
  if (contactPoints.length > 0) {
    structuredData.contactPoint = contactPoints.length === 1 ? contactPoints[0] : contactPoints;
  }

  // Enhanced Address (National Address Format)
  if (
    data.addressStreet ||
    data.addressCity ||
    data.addressCountry ||
    data.addressRegion ||
    data.addressNeighborhood ||
    data.addressBuildingNumber
  ) {
    const address: Record<string, unknown> = {
      "@type": "PostalAddress",
    };
    if (data.addressStreet) address.streetAddress = data.addressStreet as string;
    if (data.addressNeighborhood) address.addressNeighborhood = data.addressNeighborhood as string;
    if (data.addressBuildingNumber) {
      // Combine building number and additional number if both exist
      const buildingNumber = data.addressBuildingNumber as string;
      const additionalNumber = data.addressAdditionalNumber as string;
      address.streetAddress = additionalNumber
        ? `${buildingNumber}-${additionalNumber} ${address.streetAddress || ""}`.trim()
        : buildingNumber;
    }
    if (data.addressCity) address.addressLocality = data.addressCity as string;
    if (data.addressRegion) address.addressRegion = data.addressRegion as string;
    if (data.addressCountry) address.addressCountry = data.addressCountry as string;
    if (data.addressPostalCode) address.postalCode = data.addressPostalCode as string;
    structuredData.address = address;
  }

  // GeoCoordinates (Latitude & Longitude)
  if (data.addressLatitude !== null && data.addressLatitude !== undefined && 
      data.addressLongitude !== null && data.addressLongitude !== undefined) {
    structuredData.geo = {
      "@type": "GeoCoordinates",
      latitude: data.addressLatitude as number,
      longitude: data.addressLongitude as number,
    };
  }

  // Classification
  if (data.isicV4) {
    structuredData.isicV4 = data.isicV4 as string;
  }

  // Number of employees as QuantitativeValue
  if (data.numberOfEmployees) {
    const empValue = data.numberOfEmployees as string;
    // Try to parse as number or range
    if (empValue.includes("-")) {
      const [min, max] = empValue.split("-").map((v) => parseInt(v.trim()));
      if (!isNaN(min) && !isNaN(max)) {
        structuredData.numberOfEmployees = {
          "@type": "QuantitativeValue",
          minValue: min,
          maxValue: max,
        };
      }
    } else {
      const numValue = parseInt(empValue);
      if (!isNaN(numValue)) {
        structuredData.numberOfEmployees = {
          "@type": "QuantitativeValue",
          value: numValue,
        };
      } else {
        structuredData.numberOfEmployees = {
          "@type": "QuantitativeValue",
          value: empValue,
        };
      }
    }
  }

  // Parent organization relationship
  if (data.parentOrganizationId && data.parentOrganization) {
    const parentOrg = data.parentOrganization as { name: string; id?: string; url?: string };
    structuredData.parentOrganization = {
      "@type": "Organization",
      name: parentOrg.name,
      ...(parentOrg.id && { "@id": parentOrg.id }),
      ...(parentOrg.url && { url: parentOrg.url }),
    };
  }

  // Social profiles
  const sameAsArray = Array.isArray(data.sameAs) ? data.sameAs : [];
  if (sameAsArray.length > 0) {
    structuredData.sameAs = sameAsArray;
  }

  // Remove undefined values
  Object.keys(structuredData).forEach((key) => {
    if (structuredData[key] === undefined) delete structuredData[key];
  });

  return structuredData;
}

