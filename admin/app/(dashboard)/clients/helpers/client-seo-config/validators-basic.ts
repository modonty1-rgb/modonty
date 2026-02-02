// ============================================================================
// IMPORTS
// ============================================================================
import type { SEOFieldValidator } from "@/components/shared/seo-doctor";
import { getFieldMapping, type FieldMapping } from "../client-field-mapping";

/**
 * Type guard to check if recommendedLength is for text fields
 */
function isTextRecommendedLength(
  recommendedLength?: FieldMapping['recommendedLength']
): recommendedLength is { min?: number; max?: number; optimal?: number } {
  if (!recommendedLength) return false;
  return !('width' in recommendedLength) && !('height' in recommendedLength);
}

// ============================================================================
// BASIC INFORMATION VALIDATORS
// ============================================================================

export const validateName: SEOFieldValidator = (value, data) => {
  const mapping = getFieldMapping("name");
  const textLength = isTextRecommendedLength(mapping?.recommendedLength) ? mapping.recommendedLength : null;
  const optimalLength = textLength?.optimal || 50;
  const maxLength = textLength?.max || 100;
  const isRequired = mapping?.jsonLd?.required || false;
  const scoreConfig = mapping?.score;
  const optimalScore = scoreConfig?.optimal || 10;
  const adequateScore = scoreConfig?.adequate || 8;
  const missingScore = scoreConfig?.missing || 0;

  if (!value || (typeof value === "string" && value.trim().length === 0)) {
    return {
      status: isRequired ? "error" : "error",
      message: mapping?.jsonLd?.jsonLdPath
        ? `Client name is required (used in ${mapping.jsonLd.jsonLdPath})`
        : "Client name is required",
      score: missingScore,
    };
  }

  if (typeof value !== "string") {
    return {
      status: "error",
      message: "Client name must be a string",
      score: missingScore,
    };
  }

  const length = value.trim().length;

  if (optimalLength !== undefined && typeof optimalLength === 'number' && length >= optimalLength && length <= maxLength) {
    return {
      status: "good",
      message: mapping?.metaTags?.metaTagsPath
        ? `Client name is optimal (${length} chars) → ${mapping.metaTags.metaTagsPath}`
        : `Client name is optimal (${length} chars)`,
      score: optimalScore,
    };
  }

  if (length > maxLength) {
    return {
      status: "warning",
      message: `Client name too long (${length} chars, maximum ${maxLength} recommended)`,
      score: adequateScore,
    };
  }

  return {
    status: "good",
    message: `Client name is set (${length} chars)`,
    score: adequateScore,
  };
};

export const validateLegalName: SEOFieldValidator = (value, data) => {
  const mapping = getFieldMapping("legalName");
  const textLength = isTextRecommendedLength(mapping?.recommendedLength) ? mapping.recommendedLength : null;
  const maxLength = textLength?.max || 200;
  const scoreConfig = mapping?.score;
  const optimalScore = scoreConfig?.optimal || 8;
  const adequateScore = scoreConfig?.adequate || 5;
  const missingScore = scoreConfig?.missing || 0;

  if (!value || (typeof value === "string" && value.trim().length === 0)) {
    return {
      status: "warning",
      message: mapping?.jsonLd?.jsonLdPath
        ? `Legal name recommended (used in ${mapping.jsonLd.jsonLdPath})`
        : "Legal name recommended for Schema.org structured data",
      score: missingScore,
    };
  }

  if (typeof value !== "string") {
    return {
      status: "error",
      message: "Legal name must be a string",
      score: missingScore,
    };
  }

  const length = value.trim().length;

  if (length > maxLength) {
    return {
      status: "warning",
      message: `Legal name too long (${length} chars, maximum ${maxLength} recommended)`,
      score: adequateScore,
    };
  }

  return {
    status: "good",
    message: mapping?.jsonLd?.jsonLdPath
      ? `Legal name set (${length} chars) → ${mapping.jsonLd.jsonLdPath}`
      : `Legal name set for Schema.org Organization (${length} chars)`,
    score: optimalScore,
  };
};

export const validateUrl: SEOFieldValidator = (value) => {
  const mapping = getFieldMapping("url");
  const scoreConfig = mapping?.score;
  const optimalScore = scoreConfig?.optimal || 15;
  const adequateScore = scoreConfig?.adequate || 10;
  const missingScore = scoreConfig?.missing || 0;

  if (value && typeof value === "string" && value.trim().length > 0) {
    const isValidUrl = /^https?:\/\/.+\..+/.test(value);
    const isHTTPS = value.toLowerCase().startsWith("https://");

    if (isValidUrl && isHTTPS) {
      return {
        status: "good",
        message: `Valid HTTPS URL provided - secure and SEO-friendly → ${mapping?.jsonLd?.jsonLdPath || "Schema.org"}`,
        score: optimalScore,
      };
    } else if (isValidUrl) {
      return {
        status: "warning",
        message: `URL format valid but should use HTTPS for security and SEO → ${mapping?.jsonLd?.jsonLdPath || "Schema.org"}`,
        score: adequateScore,
      };
    }
    return {
      status: "warning",
      message: `URL format should be https://example.com → ${mapping?.jsonLd?.jsonLdPath || "Schema.org"}`,
      score: adequateScore,
    };
  }
  return {
    status: "warning",
    message: `Website URL recommended for Schema.org → ${mapping?.jsonLd?.jsonLdPath || "Schema.org"}`,
    score: missingScore,
  };
};

// ============================================================================
// SEO VALIDATORS
// ============================================================================

export const validateDescription: SEOFieldValidator = (value, data) => {
  const mapping = getFieldMapping("description");
  const textLength = isTextRecommendedLength(mapping?.recommendedLength) ? mapping.recommendedLength : null;
  const minLength = textLength?.min || 100;
  const optimalLength = textLength?.optimal || 300;
  const maxLength = textLength?.max || 500;
  const scoreConfig = mapping?.score;
  const optimalScore = scoreConfig?.optimal || 10;
  const adequateScore = scoreConfig?.adequate || 8;
  const missingScore = scoreConfig?.missing || 0;

  if (!value || (typeof value === "string" && value.trim().length === 0)) {
    return {
      status: "warning",
      message: mapping?.jsonLd?.jsonLdPath
        ? `Organization description recommended (used in ${mapping.jsonLd.jsonLdPath}) - minimum ${minLength} chars`
        : `Organization description recommended for Schema.org - minimum ${minLength} chars`,
      score: missingScore,
    };
  }

  if (typeof value !== "string") {
    return {
      status: "error",
      message: "Organization description must be a string",
      score: missingScore,
    };
  }

  const length = value.trim().length;

  if (optimalLength !== undefined && typeof optimalLength === 'number' && length >= optimalLength && (!maxLength || length <= maxLength)) {
    return {
      status: "good",
      message: mapping?.jsonLd?.jsonLdPath
        ? `Comprehensive description (${length} chars) → ${mapping.jsonLd.jsonLdPath}`
        : `Comprehensive description (${length} chars) for Schema.org`,
      score: optimalScore,
    };
  }

  if (length >= minLength && length < optimalLength) {
    return {
      status: "warning",
      message: `Description meets minimum (${length} chars) but recommended optimal length is ${optimalLength} chars for better SEO`,
      score: adequateScore,
    };
  }

  if (maxLength && length > maxLength) {
    return {
      status: "warning",
      message: `Description too long (${length} chars) - maximum ${maxLength} chars recommended`,
      score: adequateScore,
    };
  }

  return {
    status: "warning",
    message: `Description too short (${length} chars) - minimum ${minLength} chars recommended for Schema.org`,
    score: adequateScore,
  };
};

export const validateSlogan: SEOFieldValidator = (value, data) => {
  const mapping = getFieldMapping("slogan");
  const textLength = isTextRecommendedLength(mapping?.recommendedLength) ? mapping.recommendedLength : null;
  const maxLength = textLength?.max || 100;
  const scoreConfig = mapping?.score;
  const optimalScore = scoreConfig?.optimal || 5;
  const adequateScore = scoreConfig?.adequate || 3;
  const missingScore = scoreConfig?.missing || 0;

  if (!value || (typeof value === "string" && value.trim().length === 0)) {
    return {
      status: "warning",
      message: mapping?.jsonLd?.jsonLdPath
        ? `Organization slogan recommended (used in ${mapping.jsonLd.jsonLdPath}) - maximum ${maxLength} chars`
        : `Organization slogan recommended for Schema.org - maximum ${maxLength} chars`,
      score: missingScore,
    };
  }

  if (typeof value !== "string") {
    return {
      status: "error",
      message: "Organization slogan must be a string",
      score: missingScore,
    };
  }

  const length = value.trim().length;

  if (maxLength && length > maxLength) {
    return {
      status: "warning",
      message: `Slogan too long (${length} chars) - maximum ${maxLength} chars recommended for clarity and memorability`,
      score: adequateScore,
    };
  }

  if (length > 0 && length <= maxLength) {
    return {
      status: "good",
      message: mapping?.jsonLd?.jsonLdPath
        ? `Slogan set (${length} chars) → ${mapping.jsonLd.jsonLdPath}`
        : `Slogan set (${length} chars) for Schema.org`,
      score: optimalScore,
    };
  }

  return {
    status: "warning",
    message: `Organization slogan recommended for Schema.org - maximum ${maxLength} chars`,
    score: missingScore,
  };
};

// Re-export factory (keep separate file)
export { createValidateSEOTitleAndOG } from './create-validate-seo-title-and-og';

// ============================================================================
// CONTACT VALIDATORS
// ============================================================================

export const validateContactInfo: SEOFieldValidator = (value, data) => {
  const hasEmail =
    data.email && typeof data.email === "string" && data.email.trim().length > 0;
  const hasPhone =
    data.phone && typeof data.phone === "string" && data.phone.trim().length > 0;
  if (hasEmail && hasPhone) {
    return {
      status: "good",
      message: "Email and phone provided - complete contact info",
      score: 10,
    };
  }
  if (hasEmail || hasPhone) {
    return {
      status: "warning",
      message: "Partial contact info - add both email and phone for Schema.org",
      score: 5,
    };
  }
  return {
    status: "warning",
    message: "Contact information recommended for Schema.org Organization",
    score: 0,
  };
};

export const validateSocialProfiles: SEOFieldValidator = (value) => {
  const sameAsArray = Array.isArray(value) ? value : [];
  if (sameAsArray.length > 0) {
    const socialCount = sameAsArray.length;
    if (socialCount >= 3) {
      return {
        status: "good",
        message: `Excellent! ${socialCount} social profiles added - great for Schema.org`,
        score: 10,
      };
    } else if (socialCount >= 2) {
      return {
        status: "good",
        message: `Good! ${socialCount} social profiles added`,
        score: 8,
      };
    }
    return {
      status: "warning",
      message: `Only ${socialCount} social profile - add more for better brand verification`,
      score: 5,
    };
  }
  return {
    status: "warning",
    message: "Social profiles recommended for Schema.org sameAs property",
    score: 0,
  };
};

// ============================================================================
// ADDITIONAL VALIDATORS
// ============================================================================

export const validateFoundingDate: SEOFieldValidator = (value) => {
  // Handle Date objects, string dates, or date strings
  const hasValue = value && (
    value instanceof Date ||
    (typeof value === "string" && value.trim().length > 0) ||
    (typeof value === "object" && value !== null && "getTime" in value)
  );

  if (hasValue) {
    return {
      status: "good",
      message: "Founding date set - improves Schema.org Organization data",
      score: 5,
    };
  }
  return {
    status: "warning",
    message: "Founding date recommended for Schema.org Organization",
    score: 0,
  };
};

export const validateBusinessBrief: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length >= 100) {
    return {
      status: "good",
      message: `Comprehensive business brief (${value.length} chars)`,
      score: 10,
    };
  }
  if (value && typeof value === "string" && value.trim().length > 0) {
    return {
      status: "warning",
      message: `Business brief too short (${value.length} chars) - minimum 100 chars required`,
      score: 0,
    };
  }
  return {
    status: "error",
    message: "Business brief is required (minimum 100 chars) for content writers",
    score: 0,
  };
};

export const validateGTMId: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    const isValidGTM = /^GTM-[A-Z0-9]+$/.test(value);
    if (isValidGTM) {
      return {
        status: "good",
        message: "Valid GTM ID - enables analytics tracking",
        score: 5,
      };
    }
    return {
      status: "warning",
      message: "GTM ID format should be GTM-XXXXXXX",
      score: 0,
    };
  }
  return {
    status: "info",
    message: "GTM ID optional - enables client to see article performance",
    score: 0,
  };
};
