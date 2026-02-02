/**
 * Generate SEO Validators from Field Mapping
 * 
 * This module generates validators dynamically from CLIENT_FIELD_MAPPINGS,
 * ensuring validators use recommended lengths and requirements from the mapping file.
 */

import type { SEOFieldValidator } from "@/components/shared/seo-doctor";
import { CLIENT_FIELD_MAPPINGS, getFieldMapping, type FieldMapping } from "../client-field-mapping";

/**
 * Type guard to check if recommendedLength is for text fields
 */
function isTextRecommendedLength(
  recommendedLength?: FieldMapping['recommendedLength']
): recommendedLength is { min?: number; max?: number; optimal?: number } {
  if (!recommendedLength) return false;
  return !('width' in recommendedLength) && !('height' in recommendedLength);
}

/**
 * Generate a text field validator based on mapping data
 */
function generateTextValidator(mapping: FieldMapping): SEOFieldValidator {
  const { field, recommendedLength, metaTags, jsonLd, description, score } = mapping;
  const isRequired = metaTags?.required || jsonLd?.required || false;
  const textLength = isTextRecommendedLength(recommendedLength) ? recommendedLength : null;
  const optimal = textLength?.optimal;
  const min = textLength?.min;
  const max = textLength?.max;
  const optimalScore = score?.optimal || 10;
  const adequateScore = score?.adequate || 8;
  const missingScore = score?.missing || 0;

  return (value, data) => {
    if (!value || (typeof value === "string" && value.trim().length === 0)) {
      if (isRequired) {
        return {
          status: "error",
          message: `${description || field} is required${metaTags?.metaTagsPath ? ` (maps to ${metaTags.metaTagsPath})` : ""}`,
          score: missingScore,
        };
      }
      return {
        status: "warning",
        message: `${description || field} is recommended${jsonLd?.jsonLdPath ? ` (used in ${jsonLd.jsonLdPath})` : ""}`,
        score: missingScore,
      };
    }

    if (typeof value !== "string") {
      return {
        status: "error",
        message: `${description || field} must be a string`,
        score: missingScore,
      };
    }

    const length = value.trim().length;

    // Check optimal length
    if (optimal !== undefined && typeof optimal === 'number' && length >= optimal && (!max || length <= max)) {
      return {
        status: "good",
        message: `${description || field} is optimal (${length} chars)${metaTags?.metaTagsPath ? ` → ${metaTags.metaTagsPath}` : ""}`,
        score: optimalScore,
      };
    }

    // Check minimum length
    if (min && length < min) {
      return {
        status: "warning",
        message: `${description || field} too short (${length} chars, minimum ${min} recommended)`,
        score: adequateScore,
      };
    }

    // Check maximum length
    if (max && length > max) {
      return {
        status: "warning",
        message: `${description || field} too long (${length} chars, maximum ${max} recommended)`,
        score: adequateScore,
      };
    }

    // Good if within reasonable range
    if (length > 0) {
      return {
        status: "good",
        message: `${description || field} is set (${length} chars)`,
        score: adequateScore,
      };
    }

    return {
      status: "warning",
      message: `${description || field} should be provided`,
      score: missingScore,
    };
  };
}

/**
 * Generate a URL field validator based on mapping data
 */
function generateUrlValidator(mapping: FieldMapping): SEOFieldValidator {
  const { field, description, metaTags, jsonLd, score } = mapping;
  const isRequired = metaTags?.required || jsonLd?.required || false;
  const optimalScore = score?.optimal || 15;
  const adequateScore = score?.adequate || 10;
  const missingScore = score?.missing || 0;

  return (value, data) => {
    if (!value || (typeof value === "string" && value.trim().length === 0)) {
      if (isRequired) {
        return {
          status: "error",
          message: `${description || field} is required${jsonLd?.jsonLdPath ? ` (used in ${jsonLd.jsonLdPath})` : ""}`,
          score: missingScore,
        };
      }
      return {
        status: "warning",
        message: `${description || field} is recommended for SEO`,
        score: missingScore,
      };
    }

    if (typeof value !== "string") {
      return {
        status: "error",
        message: `${description || field} must be a valid URL string`,
        score: missingScore,
      };
    }

    try {
      const url = new URL(value);
      const isHttps = url.protocol === "https:";

      if (!isHttps) {
        return {
          status: "warning",
          message: `${description || field} should use HTTPS (currently ${url.protocol})`,
          score: adequateScore,
        };
      }

      return {
        status: "good",
        message: `${description || field} is valid HTTPS URL${metaTags?.metaTagsPath ? ` → ${metaTags.metaTagsPath}` : ""}`,
        score: optimalScore,
      };
    } catch {
      return {
        status: "error",
        message: `${description || field} is not a valid URL format`,
        score: missingScore,
      };
    }
  };
}

/**
 * Generate a date field validator based on mapping data
 */
function generateDateValidator(mapping: FieldMapping): SEOFieldValidator {
  const { field, description, jsonLd, score } = mapping;
  const isRequired = jsonLd?.required || false;
  const optimalScore = score?.optimal || 5;
  const adequateScore = score?.adequate || 3;
  const missingScore = score?.missing || 0;

  return (value, data) => {
    if (!value) {
      if (isRequired) {
        return {
          status: "error",
          message: `${description || field} is required${jsonLd?.jsonLdPath ? ` (used in ${jsonLd.jsonLdPath})` : ""}`,
          score: missingScore,
        };
      }
      return {
        status: "info",
        message: `${description || field} is optional`,
        score: missingScore,
      };
    }

    let date: Date | null = null;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === "string") {
      date = new Date(value);
      if (isNaN(date.getTime())) {
        return {
          status: "error",
          message: `${description || field} is not a valid date format`,
          score: missingScore,
        };
      }
    } else {
      return {
        status: "error",
        message: `${description || field} must be a valid date`,
        score: missingScore,
      };
    }

    // For founding date, check if it's in the past
    if (field === "foundingDate" && date > new Date()) {
      return {
        status: "warning",
        message: `${description || field} should be in the past`,
        score: adequateScore,
      };
    }

    return {
      status: "good",
      message: `${description || field} is valid${jsonLd?.jsonLdPath ? ` → ${jsonLd.jsonLdPath}` : ""}`,
      score: optimalScore,
    };
  };
}

/**
 * Generate a validator for a field based on its mapping data
 */
export function generateValidatorFromMapping(fieldName: string): SEOFieldValidator | null {
  const mapping = getFieldMapping(fieldName);
  if (!mapping) {
    return null;
  }

  // Skip fields that shouldn't have validators
  if (mapping.category === "Integration") {
    return null; // gtmId - not SEO-related
  }

  // Determine field type and generate appropriate validator
  if (mapping.field === "url" || mapping.field === "canonicalUrl") {
    return generateUrlValidator(mapping);
  }

  if (mapping.field === "foundingDate") {
    return generateDateValidator(mapping);
  }

  // Default to text validator for most fields
  if (mapping.recommendedLength || mapping.metaTags || mapping.jsonLd) {
    return generateTextValidator(mapping);
  }

  return null;
}

/**
 * Get all fields that should have validators based on mapping
 */
export function getFieldsForValidation(): string[] {
  return CLIENT_FIELD_MAPPINGS
    .filter((mapping) => {
      // Skip integration fields
      if (mapping.category === "Integration") {
        return false;
      }

      // Include fields that have MetaTags or JSON-LD mappings
      if (mapping.metaTags || mapping.jsonLd) {
        return true;
      }

      // Include fields with recommended lengths
      if (mapping.recommendedLength) {
        return true;
      }

      return false;
    })
    .map((mapping) => mapping.field);
}

/**
 * Generate field configs from mapping for SEO config
 */
export function generateFieldConfigsFromMapping(): Array<{
  name: string;
  label: string;
  validator: SEOFieldValidator;
}> {
  const fieldConfigs: Array<{
    name: string;
    label: string;
    validator: SEOFieldValidator;
  }> = [];

  for (const mapping of CLIENT_FIELD_MAPPINGS) {
    // Skip integration fields
    if (mapping.category === "Integration") {
      continue;
    }

    // Only generate for fields with MetaTags/JSON-LD mappings or recommended lengths
    if (!mapping.metaTags && !mapping.jsonLd && !mapping.recommendedLength) {
      continue;
    }

    const validator = generateValidatorFromMapping(mapping.field);
    if (validator) {
      // Create a human-readable label from field name
      const label = mapping.description || mapping.field
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      fieldConfigs.push({
        name: mapping.field,
        label,
        validator,
      });
    }
  }

  return fieldConfigs;
}
