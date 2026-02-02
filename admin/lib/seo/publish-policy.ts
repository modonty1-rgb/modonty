/**
 * Publish Policy - Phase 3
 *
 * Client-safe publish decision logic based on validation reports.
 * This module does not import Validator, so it can be safely used in client components.
 */

import type { ValidationReport } from "./jsonld-validator";

/**
 * Check if article can be published based on validation report
 */
export interface PublishDecision {
  allowed: boolean;
  reason?: string;
  blockingErrors: string[];
  warnings: string[];
}

export function canPublishArticle(
  validationReport: ValidationReport | null,
  requiredFields?: {
    hasTitle?: boolean;
    hasSlug?: boolean;
    hasCanonicalUrl?: boolean;
    hasDatePublished?: boolean;
  }
): PublishDecision {
  const blockingErrors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  const fields = requiredFields || {};
  if (fields.hasTitle === false) {
    blockingErrors.push("Missing article title");
  }
  if (fields.hasSlug === false) {
    blockingErrors.push("Missing article slug");
  }
  if (fields.hasDatePublished === false) {
    blockingErrors.push("Missing publication date");
  }

  // Check validation report
  if (validationReport) {
    // Adobe errors block publishing
    if (validationReport.adobe?.errors && validationReport.adobe.errors.length > 0) {
      for (const err of validationReport.adobe.errors) {
        blockingErrors.push(`[Schema] ${err.message}`);
      }
    }

    // Adobe warnings are just warnings
    if (validationReport.adobe?.warnings) {
      for (const warn of validationReport.adobe.warnings) {
        warnings.push(`[Schema] ${warn.message}`);
      }
    }

    // Custom errors block publishing
    if (validationReport.custom?.errors && validationReport.custom.errors.length > 0) {
      for (const err of validationReport.custom.errors) {
        blockingErrors.push(`[Business] ${err}`);
      }
    }

    // Custom warnings are just warnings
    if (validationReport.custom?.warnings) {
      for (const warn of validationReport.custom.warnings) {
        warnings.push(`[Business] ${warn}`);
      }
    }
  }

  const allowed = blockingErrors.length === 0;

  return {
    allowed,
    reason: allowed
      ? undefined
      : `Cannot publish: ${blockingErrors.length} blocking error(s)`,
    blockingErrors,
    warnings,
  };
}
