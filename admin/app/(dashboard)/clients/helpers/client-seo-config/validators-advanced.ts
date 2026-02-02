// ============================================================================
// IMPORTS
// ============================================================================
import type { SEOFieldValidator } from "@/components/shared/seo-doctor";
import type { MediaRelation } from "./media-relation";
import { getFieldMapping } from "../client-field-mapping";

// ============================================================================
// MEDIA VALIDATORS
// ============================================================================

export const validateLogo: SEOFieldValidator = (value, data) => {
  const mapping = getFieldMapping("logoMedia");
  const scoreConfig = mapping?.score;
  const optimalScore = scoreConfig?.optimal || 13;
  const adequateScore = scoreConfig?.adequate || 10;
  const missingScore = scoreConfig?.missing || 0;

  const logoMedia = data.logoMedia as MediaRelation;
  const logoUrl = (logoMedia?.url as string) || value || "";
  if (logoUrl && typeof logoUrl === "string" && logoUrl.trim().length > 0) {
    const logoUrlLower = logoUrl.toLowerCase();
    const isValidFormat = /\.(png|svg|jpg|jpeg|webp)$/i.test(logoUrlLower);
    const hasLogoAlt =
      logoMedia?.altText &&
      typeof logoMedia.altText === "string" &&
      logoMedia.altText.trim().length > 0;

    if (isValidFormat && hasLogoAlt) {
      return {
        status: "good",
        message:
          "Logo provided with valid format (PNG/SVG/JPG) and alt text - recommend min 112x112px for Google",
        score: optimalScore,
      };
    } else if (isValidFormat) {
      return {
        status: "good",
        message:
          "Logo provided with valid format (PNG/SVG/JPG) - add alt text for accessibility and SEO, recommend min 112x112px",
        score: adequateScore,
      };
    } else {
      return {
        status: "warning",
        message:
          "Logo provided but should be PNG, SVG, or JPG format - recommend min 112x112px for Google rich results",
        score: adequateScore,
      };
    }
  }
  return {
    status: "warning",
    message:
      "Logo recommended for brand recognition - use PNG/SVG/JPG, min 112x112px for Google",
    score: missingScore,
  };
};

export const validateLogoAlt: SEOFieldValidator = (value, data) => {
  const logoMedia = data.logoMedia as MediaRelation;
  const hasLogo =
    logoMedia?.url &&
    typeof logoMedia.url === "string" &&
    logoMedia.url.trim().length > 0;
  if (hasLogo) {
    if (
      logoMedia?.altText &&
      typeof logoMedia.altText === "string" &&
      logoMedia.altText.trim().length > 0
    ) {
      return {
        status: "good",
        message: "Logo alt text provided - required for accessibility and SEO",
        score: 5,
      };
    }
    return {
      status: "error",
      message:
        "Logo alt text required when logo exists (accessibility + SEO)",
      score: 0,
    };
  }
  return {
    status: "info",
    message: "Logo alt text not needed (no logo provided)",
    score: 0,
  };
};

export const validateOGImageForClient: SEOFieldValidator = (value, data) => {
  const ogImageMedia = data.ogImageMedia as MediaRelation;
  const ogImageUrl = (ogImageMedia?.url as string) || (value as string) || "";
  if (ogImageUrl && typeof ogImageUrl === "string" && ogImageUrl.trim().length > 0) {
    return {
      status: "good",
      message: "Open Graph image set for social sharing",
      score: 5,
    };
  }
  return {
    status: "warning",
    message: "OG image recommended (1200x630px) for social media",
    score: 0,
  };
};

export const validateOGImageAltForClient: SEOFieldValidator = (value, data) => {
  const ogImageMedia = data.ogImageMedia as MediaRelation;
  const hasOGImage =
    ogImageMedia?.url &&
    typeof ogImageMedia.url === "string" &&
    ogImageMedia.url.trim().length > 0;
  if (hasOGImage) {
    if (
      ogImageMedia?.altText &&
      typeof ogImageMedia.altText === "string" &&
      ogImageMedia.altText.trim().length > 0
    ) {
      return {
        status: "good",
        message: "OG image alt text provided - required for accessibility and SEO",
        score: 5,
      };
    }
    return {
      status: "error",
      message:
        "OG image alt text required when OG image exists (accessibility + SEO)",
      score: 0,
    };
  }
  return {
    status: "info",
    message: "OG image alt text not needed (no OG image provided)",
    score: 0,
  };
};

export const validateOGImageDimensionsForClient: SEOFieldValidator = (
  value,
  data,
) => {
  const ogImageMedia = data.ogImageMedia as MediaRelation;
  const hasOGImage =
    ogImageMedia?.url &&
    typeof ogImageMedia.url === "string" &&
    ogImageMedia.url.trim().length > 0;
  if (hasOGImage) {
    const hasWidth =
      ogImageMedia?.width && typeof ogImageMedia.width === "number";
    const hasHeight =
      ogImageMedia?.height && typeof ogImageMedia.height === "number";

    if (hasWidth && hasHeight) {
      const width = ogImageMedia.width as number;
      const height = ogImageMedia.height as number;
      if (width === 1200 && height === 630) {
        return {
          status: "good",
          message:
            "OG image dimensions optimal (1200x630px) - perfect for social sharing",
          score: 5,
        };
      }
      if (width >= 600 && height >= 314) {
        return {
          status: "warning",
          message: `OG image dimensions (${width}x${height}px) - recommend 1200x630px for best results`,
          score: 3,
        };
      }
      return {
        status: "warning",
        message: `OG image dimensions (${width}x${height}px) too small - minimum 600x314px, recommend 1200x630px`,
        score: 1,
      };
    }
    if (hasWidth || hasHeight) {
      return {
        status: "warning",
        message: "OG image dimensions incomplete - both width and height needed",
        score: 1,
      };
    }
    return {
      status: "warning",
      message:
        "OG image dimensions missing - add width and height (1200x630px recommended)",
      score: 0,
    };
  }
  return {
    status: "info",
    message: "OG image dimensions not needed (no OG image provided)",
    score: 0,
  };
};

export const validateTwitterCardsForClient: SEOFieldValidator = (value, data) => {
  const twitterCard = data.twitterCard;
  const isAuto = twitterCard === null;
  const hasTwitterCard = twitterCard && typeof twitterCard === "string" && twitterCard.trim().length > 0;
  const hasTwitterTitle = data.twitterTitle && typeof data.twitterTitle === "string" && data.twitterTitle.trim().length > 0;
  const hasTwitterDesc = data.twitterDescription && typeof data.twitterDescription === "string" && data.twitterDescription.trim().length > 0;
  
  const twitterImageMedia = data.twitterImageMedia as MediaRelation;
  const hasTwitterImg =
    twitterImageMedia?.url &&
    typeof twitterImageMedia.url === "string" &&
    twitterImageMedia.url.trim().length > 0;
  
  const hasTwitterImageAlt =
    twitterImageMedia?.altText &&
    typeof twitterImageMedia.altText === "string" &&
    twitterImageMedia.altText.trim().length > 0;
  
  const ogImageMedia = data.ogImageMedia as MediaRelation;
  const canAutoGenerate = data.seoTitle && data.seoDescription && ogImageMedia?.url;
  
  // Auto-generate selected and can auto-generate
  if (isAuto && canAutoGenerate) {
    return {
      status: "good",
      message: "Twitter Cards set to auto-generate from SEO title, description, and OG image - optimal configuration",
      score: 10,
    };
  }
  
  // Auto-generate selected but cannot auto-generate
  if (isAuto && !canAutoGenerate) {
    const missing = [];
    if (!data.seoTitle) missing.push("SEO title");
    if (!data.seoDescription) missing.push("SEO description");
    if (!ogImageMedia?.url) missing.push("OG image");
    const missingList = missing.join(", ");

    return {
      status: "warning",
      message:
        missing.length === 1 && missing[0] === "OG image"
          ? "Twitter Cards are set to auto-generate from SEO fields, but the Open Graph image is not set yet. After you create and save the client, open the edit screen, go to the Media (OG image) section, and add an image to reach 100% Meta."
          : `Twitter Cards are set to auto-generate, but missing: ${missingList}. Fill these fields so we can generate Twitter Cards automatically.`,
      score: 3,
    };
  }
  
  // Complete configuration
  if (hasTwitterCard && hasTwitterTitle && hasTwitterDesc && hasTwitterImg) {
    let message = "Complete Twitter Cards configured - optimal for social SEO";
    let score = 10;
    
    if (hasTwitterImageAlt) {
      message += " - Includes alt text for accessibility";
      score = 15;
    } else {
      message += " - Add image alt text for accessibility and SEO";
    }
    
    return {
      status: "good",
      message,
      score,
    };
  }
  
  // Card type selected but missing other fields
  if (hasTwitterCard) {
    const missing = [];
    if (!hasTwitterTitle) missing.push("Twitter title");
    if (!hasTwitterDesc) missing.push("Twitter description");
    if (!hasTwitterImg && !ogImageMedia?.url) missing.push("Twitter/OG image");
    
    if (missing.length > 0) {
      return {
        status: "warning",
        message: `Twitter Card type set (${twitterCard}), but missing: ${missing.join(", ")}. Add missing fields or use auto-generation.`,
        score: 3,
      };
    }
  }
  
  // Can auto-generate from existing fields
  if (canAutoGenerate) {
    return {
      status: "warning",
      message: "Twitter Cards can be auto-generated from existing fields - add for better social SEO",
      score: 5,
    };
  }
  
  // No configuration
  return {
    status: "warning",
    message: "Twitter Cards recommended for social SEO signals - improves engagement and CTR",
    score: 0,
  };
};

export const validateTwitterImageAltForClient: SEOFieldValidator = (
  value,
  data,
) => {
  const twitterImageMedia = data.twitterImageMedia as MediaRelation;
  const hasTwitterImage =
    twitterImageMedia?.url &&
    typeof twitterImageMedia.url === "string" &&
    twitterImageMedia.url.trim().length > 0;
  if (hasTwitterImage) {
    if (
      twitterImageMedia?.altText &&
      typeof twitterImageMedia.altText === "string" &&
      twitterImageMedia.altText.trim().length > 0
    ) {
      return {
        status: "good",
        message:
          "Twitter image alt text provided - required for accessibility and SEO",
        score: 5,
      };
    }
    return {
      status: "error",
      message:
        "Twitter image alt text required when Twitter image exists (accessibility + SEO)",
      score: 0,
    };
  }
  return {
    status: "info",
    message: "Twitter image alt text not needed (no Twitter image provided)",
    score: 0,
  };
};

// ============================================================================
// ADDRESS VALIDATORS
// ============================================================================

// Saudi Arabia regions/provinces
const SAUDI_REGIONS = [
  "Riyadh",
  "Makkah",
  "Al Madinah",
  "Eastern Province",
  "Al Qassim",
  "Asir",
  "Tabuk",
  "Hail",
  "Northern Borders",
  "Jazan",
  "Najran",
  "Al Bahah",
  "Al Jawf",
];

export const validateAddress: SEOFieldValidator = (value, data) => {
  const hasAddress =
    (data.addressStreet &&
      typeof data.addressStreet === "string" &&
      data.addressStreet.trim().length > 0) ||
    (data.addressCity &&
      typeof data.addressCity === "string" &&
      data.addressCity.trim().length > 0) ||
    (data.addressCountry &&
      typeof data.addressCountry === "string" &&
      data.addressCountry.trim().length > 0);

  if (hasAddress) {
    const hasStreet =
      data.addressStreet &&
      typeof data.addressStreet === "string" &&
      data.addressStreet.trim().length > 0;
    const hasCity =
      data.addressCity &&
      typeof data.addressCity === "string" &&
      data.addressCity.trim().length > 0;
    const hasCountry =
      data.addressCountry &&
      typeof data.addressCountry === "string" &&
      data.addressCountry.trim().length > 0;
    const hasRegion =
      data.addressRegion &&
      typeof data.addressRegion === "string" &&
      data.addressRegion.trim().length > 0;
    const hasPostalCode =
      data.addressPostalCode &&
      typeof data.addressPostalCode === "string" &&
      data.addressPostalCode.trim().length > 0;
    const hasBuildingNumber =
      data.addressBuildingNumber &&
      typeof data.addressBuildingNumber === "string" &&
      data.addressBuildingNumber.trim().length > 0;

    // Check for National Address format (9-digit postal code)
    const postalCodeValid =
      hasPostalCode &&
      (data.addressPostalCode as string).replace(/\D/g, "").length >= 5;
    const hasNationalAddressFormat =
      hasPostalCode &&
      (data.addressPostalCode as string).replace(/\D/g, "").length === 9;

    // Complete address with National Address format
    if (
      hasStreet &&
      hasCity &&
      hasCountry &&
      hasRegion &&
      hasNationalAddressFormat &&
      hasBuildingNumber
    ) {
      return {
        status: "good",
        message:
          "Complete National Address format provided (9-digit postal code, building number) - optimal for Saudi Arabia local SEO",
        score: 10,
      };
    }

    // Complete address with region
    if (hasStreet && hasCity && hasCountry && hasRegion && postalCodeValid) {
      return {
        status: "good",
        message:
          "Complete address with region provided - enables LocalBusiness schema for local SEO",
        score: 7,
      };
    }

    // Complete basic address
    if (hasStreet && hasCity && hasCountry) {
      return {
        status: "good",
        message:
          "Complete address provided - enables LocalBusiness schema for local SEO",
        score: 5,
      };
    }

    // Partial address
    return {
      status: "warning",
      message:
        "Partial address - add street, city, country, and region for complete LocalBusiness schema. For Saudi Arabia, include 9-digit postal code and building number for National Address format.",
      score: 2,
    };
  }
  return {
    status: "info",
    message:
      "Address optional - only needed for local businesses (enables LocalBusiness schema)",
    score: 0,
  };
};

export const validateAddressRegion: SEOFieldValidator = (value, data) => {
  const addressRegion = data.addressRegion;
  const hasCountry = data.addressCountry && typeof data.addressCountry === "string" && data.addressCountry.trim().length > 0;
  const isSaudi = hasCountry && (data.addressCountry as string).toUpperCase() === "SA";

  if (!addressRegion || typeof addressRegion !== "string" || addressRegion.trim().length === 0) {
    if (isSaudi) {
      return {
        status: "warning",
        message: "Address Region is important for Saudi Arabia - add province/region for complete address",
        score: 0,
      };
    }
    return {
      status: "info",
      message: "Address Region optional - add for complete address information",
      score: 0,
    };
  }

  const region = addressRegion.trim();

  if (isSaudi) {
    const isValidRegion = SAUDI_REGIONS.some(
      (r) => r.toLowerCase() === region.toLowerCase()
    );

    if (isValidRegion) {
      return {
        status: "good",
        message: "Address Region is valid Saudi province",
        score: 5,
      };
    }
    return {
      status: "warning",
      message: `Address Region should be one of Saudi Arabia's 13 regions: ${SAUDI_REGIONS.join(", ")}`,
      score: 2,
    };
  }

  return {
    status: "good",
    message: "Address Region provided",
    score: 3,
  };
};

export const validateNationalAddress: SEOFieldValidator = (value, data) => {
  const hasPostalCode =
    data.addressPostalCode &&
    typeof data.addressPostalCode === "string" &&
    data.addressPostalCode.trim().length > 0;
  const hasBuildingNumber =
    data.addressBuildingNumber &&
    typeof data.addressBuildingNumber === "string" &&
    data.addressBuildingNumber.trim().length > 0;
  const hasNeighborhood =
    data.addressNeighborhood &&
    typeof data.addressNeighborhood === "string" &&
    data.addressNeighborhood.trim().length > 0;
  const isSaudi =
    data.addressCountry &&
    typeof data.addressCountry === "string" &&
    (data.addressCountry as string).toUpperCase() === "SA";

  if (!isSaudi) {
    return {
      status: "info",
      message: "National Address format is specific to Saudi Arabia",
      score: 0,
    };
  }

  if (hasPostalCode) {
    const postalCode = (data.addressPostalCode as string).replace(/\D/g, "");
    const is9Digit = postalCode.length === 9;
    const is5Digit = postalCode.length === 5;

    if (is9Digit && hasBuildingNumber && hasNeighborhood) {
      return {
        status: "good",
        message:
          "Complete National Address format (9-digit postal code, building number, neighborhood) - optimal for Saudi Arabia",
        score: 10,
      };
    }
    if (is9Digit && hasBuildingNumber) {
      return {
        status: "good",
        message:
          "National Address format with 9-digit postal code and building number - add neighborhood for complete format",
        score: 8,
      };
    }
    if (is9Digit) {
      return {
        status: "good",
        message:
          "9-digit postal code provided - add building number and neighborhood for complete National Address format",
        score: 6,
      };
    }
    if (is5Digit) {
      return {
        status: "warning",
        message:
          "5-digit postal code provided - National Address format requires 9-digit postal code (mandatory from 2026)",
        score: 3,
      };
    }
    return {
      status: "warning",
      message:
        "Postal code format invalid - National Address requires 9-digit postal code",
      score: 1,
    };
  }

  if (hasBuildingNumber) {
    return {
      status: "warning",
      message:
        "Building number provided - add 9-digit postal code for National Address format",
      score: 2,
    };
  }

  return {
    status: "info",
    message:
      "National Address format (9-digit postal code, building number) is mandatory in Saudi Arabia from 2026 - recommended to include now",
    score: 0,
  };
};

// ============================================================================
// CONTACT POINT VALIDATORS
// ============================================================================

export const validateContactPoint: SEOFieldValidator = (value, data) => {
  const hasContactType =
    data.contactType &&
    typeof data.contactType === "string" &&
    data.contactType.trim().length > 0;
  const hasContactInfo =
    (data.email &&
      typeof data.email === "string" &&
      data.email.trim().length > 0) ||
    (data.phone &&
      typeof data.phone === "string" &&
      data.phone.trim().length > 0);

  // Check for multiple contact points (if implemented as array)
  const hasMultipleContactPoints = Array.isArray(data.contactPoints) && data.contactPoints.length > 1;
  const hasLanguageSupport = Array.isArray(data.knowsLanguage) && data.knowsLanguage.length > 0;

  if (hasMultipleContactPoints && hasContactType && hasContactInfo) {
    return {
      status: "good",
      message:
        "Multiple ContactPoints with types and language support - excellent Schema.org compliance",
      score: 10,
    };
  }

  if (hasContactType && hasContactInfo && hasLanguageSupport) {
    return {
      status: "good",
      message:
        "ContactPoint structured with contactType and language support - better Schema.org compliance",
      score: 7,
    };
  }

  if (hasContactType && hasContactInfo) {
    return {
      status: "good",
      message:
        "ContactPoint structured with contactType - better Schema.org compliance",
      score: 5,
    };
  }
  if (hasContactInfo) {
    return {
      status: "warning",
      message:
        "Add contactType (e.g., customer service) and language support for better Schema.org ContactPoint structure",
      score: 2,
    };
  }
  return {
    status: "warning",
    message:
      "ContactPoint structure recommended - add contactType and contact info",
    score: 0,
  };
};

export const validateMultipleContactPoints: SEOFieldValidator = (value, data) => {
  // Check if contactPoints is an array (for future multiple contact points support)
  const contactPoints = data.contactPoints;
  
  if (Array.isArray(contactPoints) && contactPoints.length > 0) {
    let validCount = 0;
    let hasLanguage = 0;
    let hasAreaServed = 0;

    for (const cp of contactPoints) {
      if (typeof cp === "object" && cp !== null) {
        const hasType = cp.contactType && typeof cp.contactType === "string";
        const hasEmail = cp.email && typeof cp.email === "string";
        const hasPhone = cp.telephone && typeof cp.telephone === "string";
        const hasContactMethod = hasEmail || hasPhone;

        if (hasType && hasContactMethod) {
          validCount++;
        }
        if (cp.availableLanguage && Array.isArray(cp.availableLanguage) && cp.availableLanguage.length > 0) {
          hasLanguage++;
        }
        if (cp.areaServed && (typeof cp.areaServed === "string" || Array.isArray(cp.areaServed))) {
          hasAreaServed++;
        }
      }
    }

    if (validCount === contactPoints.length && hasLanguage === contactPoints.length && hasAreaServed === contactPoints.length) {
      return {
        status: "good",
        message: `All ${contactPoints.length} contact points are valid with type, language, and area served - excellent Schema.org compliance`,
        score: 10,
      };
    }
    if (validCount === contactPoints.length) {
      return {
        status: "good",
        message: `All ${contactPoints.length} contact points are valid - add language and area served for better compliance`,
        score: 7,
      };
    }
    return {
      status: "warning",
      message: `${validCount}/${contactPoints.length} contact points are valid - each needs type and at least one contact method`,
      score: 3,
    };
  }

  // Fallback to single contact point validation
  const hasContactType =
    data.contactType &&
    typeof data.contactType === "string" &&
    data.contactType.trim().length > 0;
  const hasContactInfo =
    (data.email &&
      typeof data.email === "string" &&
      data.email.trim().length > 0) ||
    (data.phone &&
      typeof data.phone === "string" &&
      data.phone.trim().length > 0);

  if (hasContactType && hasContactInfo) {
    return {
      status: "good",
      message: "Single contact point valid - consider adding multiple contact points for different purposes",
      score: 5,
    };
  }

  return {
    status: "warning",
    message: "Contact point structure recommended - add contactType and contact info",
    score: 0,
  };
};

// ============================================================================
// BUSINESS IDENTIFIERS VALIDATORS
// ============================================================================

// Legal forms in Saudi Arabia
const LEGAL_FORMS = [
  "LLC",
  "JSC",
  "Sole Proprietorship",
  "Partnership",
  "Limited Partnership",
  "Simplified Joint Stock Company",
];

export const validateSaudiIdentifiers: SEOFieldValidator = (value, data) => {
  const hasCRNumber =
    data.commercialRegistrationNumber &&
    typeof data.commercialRegistrationNumber === "string" &&
    data.commercialRegistrationNumber.trim().length > 0;
  const hasVATID =
    data.vatID &&
    typeof data.vatID === "string" &&
    data.vatID.trim().length > 0;
  const hasTaxID =
    data.taxID &&
    typeof data.taxID === "string" &&
    data.taxID.trim().length > 0;
  const hasLegalForm =
    data.legalForm &&
    typeof data.legalForm === "string" &&
    data.legalForm.trim().length > 0;

  // CR Number is CRITICAL for Saudi Arabia
  if (hasCRNumber) {
    const crNumber = data.commercialRegistrationNumber as string;
    // Basic format check (usually numeric, can have dashes)
    const isValidFormat = /^[\d-]+$/.test(crNumber.replace(/\s/g, ""));

    if (isValidFormat && hasLegalForm) {
      return {
        status: "good",
        message:
          "Commercial Registration Number and Legal Form provided - critical for Saudi Arabia business registration",
        score: 10,
      };
    }
    if (isValidFormat) {
      return {
        status: "good",
        message:
          "Commercial Registration Number provided - add Legal Form for complete registration info",
        score: 7,
      };
    }
    return {
      status: "warning",
      message:
        "Commercial Registration Number format may be invalid - should be numeric with optional dashes",
      score: 5,
    };
  }

  // VAT ID validation (ZATCA format)
  if (hasVATID) {
    const vatID = data.vatID as string;
    // ZATCA VAT ID format: usually 15 digits
    const isValidVATFormat = /^\d{15}$/.test(vatID.replace(/\s/g, ""));

    if (isValidVATFormat) {
      return {
        status: "good",
        message: "VAT ID format valid (ZATCA)",
        score: 5,
      };
    }
    return {
      status: "warning",
      message: "VAT ID format may be invalid - ZATCA format is typically 15 digits",
      score: 2,
    };
  }

  // Tax ID validation
  if (hasTaxID) {
    return {
      status: "good",
      message: "Tax ID provided",
      score: 3,
    };
  }

  // Legal Form validation
  if (hasLegalForm) {
    const legalForm = data.legalForm as string;
    const isValidForm = LEGAL_FORMS.some(
      (form) => form.toLowerCase() === legalForm.toLowerCase()
    );

    if (isValidForm) {
      return {
        status: "good",
        message: "Legal Form provided - add Commercial Registration Number for complete registration",
        score: 5,
      };
    }
    return {
      status: "warning",
      message: `Legal Form should be one of: ${LEGAL_FORMS.join(", ")}`,
      score: 2,
    };
  }

  return {
    status: "warning",
    message:
      "Commercial Registration Number and Legal Form are critical for Saudi Arabia - highly recommended to include",
    score: 0,
  };
};

export const validateLegalForm: SEOFieldValidator = (value, data) => {
  const legalForm = data.legalForm;
  
  if (!legalForm || typeof legalForm !== "string" || legalForm.trim().length === 0) {
    return {
      status: "warning",
      message: "Legal Form is mandatory in Saudi Arabia - select entity type (LLC, JSC, etc.)",
      score: 0,
    };
  }

  const isValidForm = LEGAL_FORMS.some(
    (form) => form.toLowerCase() === (legalForm as string).toLowerCase()
  );

  if (isValidForm) {
    return {
      status: "good",
      message: "Legal Form is valid",
      score: 5,
    };
  }

  return {
    status: "warning",
    message: `Legal Form should be one of: ${LEGAL_FORMS.join(", ")}`,
    score: 2,
  };
};

// ============================================================================
// CLASSIFICATION VALIDATORS
// ============================================================================

export const validateClassification: SEOFieldValidator = (value, data) => {
  const hasISIC =
    data.isicV4 &&
    typeof data.isicV4 === "string" &&
    data.isicV4.trim().length > 0;
  const hasBusinessActivityCode =
    data.businessActivityCode &&
    typeof data.businessActivityCode === "string" &&
    data.businessActivityCode.trim().length > 0;

  // ISIC V4 format: usually 4 digits (can have sections like 0111, 0112, etc.)
  if (hasISIC) {
    const isicCode = data.isicV4 as string;
    const isValidISIC = /^\d{4}(\.\d{1,2})?$/.test(isicCode.trim());

    if (isValidISIC && hasBusinessActivityCode) {
      return {
        status: "good",
        message:
          "Both ISIC V4 and Business Activity Code provided - comprehensive classification",
        score: 8,
      };
    }
    if (isValidISIC) {
      return {
        status: "good",
        message: "ISIC V4 code format valid",
        score: 5,
      };
    }
    return {
      status: "warning",
      message:
        "ISIC V4 format may be invalid - should be 4 digits (e.g., 0111) or with section (e.g., 0111.1)",
      score: 2,
    };
  }

  if (hasBusinessActivityCode) {
    return {
      status: "good",
      message: "Business Activity Code provided - add ISIC V4 for international classification",
      score: 5,
    };
  }

  return {
    status: "info",
    message:
      "Classification codes optional - ISIC V4 (international) and Business Activity Code (local) help with categorization",
    score: 0,
  };
};

export const validateOrganizationType: SEOFieldValidator = (value, data) => {
  const ORGANIZATION_TYPES = [
    "Organization",
    "Corporation",
    "LocalBusiness",
    "NonProfit",
    "EducationalOrganization",
    "GovernmentOrganization",
    "SportsOrganization",
    "NGO",
  ];

  const organizationType = data.organizationType;

  if (!organizationType || typeof organizationType !== "string" || organizationType.trim().length === 0) {
    return {
      status: "info",
      message:
        "Organization Type optional - using specific subtype (Corporation, LocalBusiness, etc.) improves Schema.org precision",
      score: 0,
    };
  }

  const isValidType = ORGANIZATION_TYPES.some(
    (type) => type.toLowerCase() === (organizationType as string).toLowerCase()
  );

  if (isValidType) {
    return {
      status: "good",
      message: "Organization Type is valid - using specific subtype improves Schema.org precision",
      score: 5,
    };
  }

  return {
    status: "warning",
    message: `Organization Type should be one of: ${ORGANIZATION_TYPES.join(", ")}`,
    score: 2,
  };
};

export const validateNumberOfEmployees: SEOFieldValidator = (value, data) => {
  const numberOfEmployees = data.numberOfEmployees;

  if (!numberOfEmployees || typeof numberOfEmployees !== "string" || numberOfEmployees.trim().length === 0) {
    return {
      status: "info",
      message: "Number of Employees optional - helps with business size classification",
      score: 0,
    };
  }

  const empValue = numberOfEmployees.trim();

  // Check for range format (e.g., "10-50", "100-500")
  if (empValue.includes("-")) {
    const [min, max] = empValue.split("-").map((v) => parseInt(v.trim()));
    if (!isNaN(min) && !isNaN(max) && min > 0 && max > min) {
      return {
        status: "good",
        message: "Number of Employees range format valid (e.g., 10-50)",
        score: 5,
      };
    }
    return {
      status: "warning",
      message: "Number of Employees range format invalid - use format: min-max (e.g., 10-50)",
      score: 1,
    };
  }

  // Check for single number
  const numValue = parseInt(empValue);
  if (!isNaN(numValue) && numValue > 0) {
    return {
      status: "good",
      message: "Number of Employees format valid",
      score: 5,
    };
  }

  return {
    status: "warning",
    message: "Number of Employees format invalid - use number (e.g., 50) or range (e.g., 10-50)",
    score: 1,
  };
};

export const validateLicenseInfo: SEOFieldValidator = (value, data) => {
  const hasLicenseNumber =
    data.licenseNumber &&
    typeof data.licenseNumber === "string" &&
    data.licenseNumber.trim().length > 0;
  const hasLicenseAuthority =
    data.licenseAuthority &&
    typeof data.licenseAuthority === "string" &&
    data.licenseAuthority.trim().length > 0;

  if (hasLicenseNumber && hasLicenseAuthority) {
    return {
      status: "good",
      message:
        "License information complete (number and authority) - important for regulated sectors",
      score: 8,
    };
  }

  if (hasLicenseNumber) {
    return {
      status: "warning",
      message:
        "License number provided - add license authority (regulatory body) for complete license information",
      score: 4,
    };
  }

  if (hasLicenseAuthority) {
    return {
      status: "warning",
      message:
        "License authority provided - add license number for complete license information",
      score: 4,
    };
  }

  return {
    status: "info",
    message:
      "License information optional - required for regulated sectors (healthcare, finance, education, etc.)",
    score: 0,
  };
};
