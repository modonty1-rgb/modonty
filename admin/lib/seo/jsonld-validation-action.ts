"use server";

import { validateJsonLdComplete } from "./jsonld-validator";
import { normalizeJsonLd } from "./jsonld-processor";
import type { ValidationReport } from "./jsonld-validator";

export async function validateJsonLdPreview(
  jsonLd: object,
  options?: {
    requirePublisherLogo?: boolean;
    requireHeroImage?: boolean;
    requireAuthorBio?: boolean;
    minHeadlineLength?: number;
    maxHeadlineLength?: number;
    skipNormalization?: boolean;
  }
): Promise<{
  success: boolean;
  validationReport: ValidationReport | null;
  error?: string;
}> {
  try {
    // Skip normalization for preview validation (Ajv is Source of Truth for raw structure)
    const dataToValidate = options?.skipNormalization 
      ? jsonLd 
      : await normalizeJsonLd(jsonLd);
    
    // Validate using Source of Truth
    const validationReport = await validateJsonLdComplete(dataToValidate, options);
    
    return {
      success: true,
      validationReport,
    };
  } catch (error) {
    return {
      success: false,
      validationReport: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
