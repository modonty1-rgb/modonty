/**
 * JSON-LD Validator - Phase 5
 *
 * Uses @adobe/structured-data-validator for official schema.org validation.
 * Uses Ajv for fast custom business rules validation.
 * Provides validation reports, error classification, and publish policy.
 */

import Validator from "@adobe/structured-data-validator";
import Ajv from "ajv";
import addFormats from "ajv-formats";

// Validation result structure
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  timestamp: string;
}

export interface ValidationError {
  message: string;
  path?: string;
  property?: string;
  type?: string;
}

export interface ValidationWarning {
  message: string;
  path?: string;
  property?: string;
  recommendation?: string;
}

// Full validation report (stored in database)
export interface ValidationReport {
  adobe: ValidationResult;
  ajv?: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
  custom?: {
    errors: string[];
    warnings: string[];
    info: string[];
  };
  richResults?: {
    eligible: boolean;
    types: string[];
    lastChecked?: string;
  };
}

// Cache schema.org definition to avoid repeated fetches
let cachedSchemaOrgJson: unknown = null;
let schemaOrgLastFetched: number = 0;
const SCHEMA_ORG_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Fetch schema.org definition (cached)
 */
async function getSchemaOrgDefinition(): Promise<unknown> {
  const now = Date.now();

  // Return cached version if still valid
  if (cachedSchemaOrgJson && now - schemaOrgLastFetched < SCHEMA_ORG_CACHE_TTL) {
    return cachedSchemaOrgJson;
  }

  try {
    const response = await fetch(
      "https://schema.org/version/latest/schemaorg-all-https.jsonld",
      {
        next: { revalidate: SCHEMA_ORG_CACHE_TTL / 1000 }, // Next.js cache
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch schema.org: ${response.status}`);
    }

    cachedSchemaOrgJson = await response.json();
    schemaOrgLastFetched = now;

    return cachedSchemaOrgJson;
  } catch (error) {
    console.error("Failed to fetch schema.org definition:", error);

    // Return cached version if available (even if expired)
    if (cachedSchemaOrgJson) {
      return cachedSchemaOrgJson;
    }

    throw error;
  }
}

/**
 * Validate JSON-LD against schema.org using Adobe validator
 */
export async function validateJsonLd(jsonLd: object): Promise<ValidationResult> {
  const timestamp = new Date().toISOString();

  try {
    const schemaOrg = await getSchemaOrgDefinition();
    const validator = new Validator(schemaOrg);
    const result = await validator.validate(jsonLd);

    // Process errors
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (result.errors && Array.isArray(result.errors)) {
      for (const err of result.errors) {
        errors.push({
          message: err.message || "Unknown error",
          path: err.path,
          property: err.property,
          type: err.type,
        });
      }
    }

    if (result.warnings && Array.isArray(result.warnings)) {
      for (const warn of result.warnings) {
        warnings.push({
          message: warn.message || "Unknown warning",
          path: warn.path,
          property: warn.property,
          recommendation: warn.recommendation,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      timestamp,
    };
  } catch (error) {
    // Return error result if validation fails
    return {
      valid: false,
      errors: [
        {
          message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
          type: "VALIDATION_FAILED",
        },
      ],
      warnings: [],
      timestamp,
    };
  }
}

/**
 * Business rules validation (custom rules beyond schema.org)
 */
export interface BusinessValidationResult {
  errors: string[];
  warnings: string[];
  info: string[];
}

/**
 * Ajv instance for custom business rules validation
 */
const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

/**
 * Article JSON Schema for Ajv validation
 * Type-specific validation for perfect JSON-LD structure
 */
const articleSchema = {
  type: "object",
  properties: {
    "@context": { 
      type: "string",
      const: "https://schema.org"
    },
    "@graph": {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["@type"],
        properties: {
          "@type": { type: "string" },
          "@id": { type: "string" },
        },
        allOf: [
          {
            if: {
              properties: { "@type": { const: "Article" } }
            },
            then: {
              required: ["@id", "headline", "datePublished", "dateModified", "author", "publisher"],
              properties: {
                headline: {
                  type: "string",
                  minLength: 30,
                  maxLength: 110,
                },
                datePublished: {
                  type: "string",
                  format: "date-time",
                },
                dateModified: {
                  type: "string",
                  format: "date-time",
                },
                author: {
                  type: "object",
                  required: ["@id"],
                  properties: {
                    "@id": { type: "string", pattern: "^https?://" }
                  }
                },
                publisher: {
                  type: "object",
                  required: ["@id"],
                  properties: {
                    "@id": { type: "string", pattern: "^https?://" }
                  }
                },
                inLanguage: { type: "string" },
                isAccessibleForFree: { type: "boolean" },
              }
            }
          },
          {
            if: {
              properties: { "@type": { const: "Person" } }
            },
            then: {
              required: ["@id", "name"],
              properties: {
                name: { type: "string", minLength: 1 },
                description: { type: "string" },
                image: { type: "string" },
                url: { type: "string" },
              }
            }
          },
          {
            if: {
              properties: { "@type": { const: "Organization" } }
            },
            then: {
              required: ["@id", "name"],
              properties: {
                name: { type: "string", minLength: 1 },
                url: { type: "string" },
                logo: { type: "object" },
              }
            }
          },
          {
            if: {
              properties: { "@type": { const: "WebPage" } }
            },
            then: {
              required: ["@id", "url"],
              properties: {
                url: { type: "string", pattern: "^https?://" },
                name: { type: "string" },
                description: { type: "string" },
              }
            }
          },
          {
            if: {
              properties: { "@type": { const: "BreadcrumbList" } }
            },
            then: {
              required: ["@id", "itemListElement"],
              properties: {
                itemListElement: {
                  type: "array",
                  minItems: 1,
                }
              }
            }
          }
        ]
      },
    },
  },
  required: ["@context", "@graph"],
};

const validateArticleSchema = ajv.compile(articleSchema);

/**
 * Validate JSON-LD using Ajv custom business rules
 * Fast validation for business logic beyond schema.org
 */
export function validateWithAjv(jsonLd: object): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  // Debug logging (temporary)
  console.log('🔍 Ajv Validation Input:', JSON.stringify(jsonLd, null, 2));
  
  const errors: string[] = [];
  const warnings: string[] = [];

  const valid = validateArticleSchema(jsonLd);
  
  console.log(valid ? '✅ Ajv Validation: PASS' : '❌ Ajv Validation: FAIL');

  if (!valid && validateArticleSchema.errors) {
    console.log('❌ Ajv Errors:', validateArticleSchema.errors);
    for (const error of validateArticleSchema.errors) {
      const message = `${error.instancePath || error.schemaPath}: ${error.message}`;
      if (error.keyword === "required" || error.keyword === "format") {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }
  }

  // Additional business rule checks
  const graph = (jsonLd as { "@graph"?: unknown[] })["@graph"];
  if (graph && Array.isArray(graph)) {
    const articleNode = graph.find(
      (n: unknown) => (n as { "@type"?: string })["@type"] === "Article"
    ) as Record<string, unknown> | undefined;

    if (articleNode) {
      const headline = articleNode.headline as string | undefined;
      if (headline) {
        if (headline.length < 30) {
          warnings.push(
            `Headline too short (${headline.length} chars). Recommended: 30+ chars`
          );
        }
        if (headline.length > 110) {
          warnings.push(
            `Headline may be truncated (${headline.length} chars). Recommended: 110 max`
          );
        }
      }
    }
  }

  return { valid, errors, warnings };
}

export async function validateBusinessRules(
  jsonLd: object,
  options?: {
    requirePublisherLogo?: boolean;
    requireHeroImage?: boolean;
    requireAuthorBio?: boolean;
    minHeadlineLength?: number;
    maxHeadlineLength?: number;
  }
): Promise<BusinessValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  const opts = {
    requirePublisherLogo: true,
    requireHeroImage: true,
    requireAuthorBio: false,
    minHeadlineLength: 30,
    maxHeadlineLength: 110,
    ...options,
  };

  // Extract graph from JSON-LD
  const graph = (jsonLd as { "@graph"?: unknown[] })["@graph"];
  if (!graph || !Array.isArray(graph)) {
    errors.push("JSON-LD must contain @graph array");
    return { errors, warnings, info };
  }

  // Find Article node
  const articleNode = graph.find(
    (n: unknown) => (n as { "@type"?: string })["@type"] === "Article"
  ) as Record<string, unknown> | undefined;

  if (!articleNode) {
    errors.push("Missing Article node in @graph");
    return { errors, warnings, info };
  }

  // Check headline length
  const headline = articleNode.headline as string | undefined;
  if (headline) {
    if (headline.length < opts.minHeadlineLength) {
      warnings.push(
        `Headline too short (${headline.length} chars). Recommended: ${opts.minHeadlineLength}+ chars`
      );
    }
    if (headline.length > opts.maxHeadlineLength) {
      warnings.push(
        `Headline may be truncated (${headline.length} chars). Recommended: ${opts.maxHeadlineLength} max`
      );
    }
  } else {
    errors.push("Missing headline in Article");
  }

  // Check datePublished
  if (!articleNode.datePublished) {
    errors.push("Missing datePublished in Article (required for published articles)");
  }

  // Check publisher
  const publisherRef = articleNode.publisher as { "@id"?: string } | undefined;
  if (!publisherRef || !publisherRef["@id"]) {
    errors.push("Missing publisher reference in Article");
  } else {
    // Find Organization node
    const orgNode = graph.find(
      (n: unknown) =>
        (n as { "@type"?: string })["@type"] === "Organization" &&
        (n as { "@id"?: string })["@id"] === publisherRef["@id"]
    ) as Record<string, unknown> | undefined;

    if (!orgNode) {
      errors.push("Publisher Organization node not found in @graph");
    } else if (opts.requirePublisherLogo && !orgNode.logo) {
      errors.push("Publisher logo missing (required for Article rich results)");
    }
  }

  // Check author
  const authorRef = articleNode.author as { "@id"?: string } | undefined;
  if (!authorRef || !authorRef["@id"]) {
    errors.push("Missing author reference in Article");
  } else {
    // Find Person node
    const personNode = graph.find(
      (n: unknown) =>
        (n as { "@type"?: string })["@type"] === "Person" &&
        (n as { "@id"?: string })["@id"] === authorRef["@id"]
    ) as Record<string, unknown> | undefined;

    if (!personNode) {
      errors.push("Author Person node not found in @graph");
    } else {
      if (!personNode.name) {
        errors.push("Author name missing");
      }
      if (opts.requireAuthorBio && !personNode.description) {
        warnings.push("Author bio missing (recommended for E-E-A-T)");
      }
    }
  }

  // Check image
  if (opts.requireHeroImage && !articleNode.image) {
    warnings.push("Hero image missing (recommended for rich results)");
  }

  // Check for FAQPage if mainEntity references it
  const faqNodes = graph.filter(
    (n: unknown) => (n as { "@type"?: string })["@type"] === "FAQPage"
  );
  if (faqNodes.length > 0) {
    info.push(`FAQPage found with ${faqNodes.length} FAQ section(s)`);
  }

  return { errors, warnings, info };
}

/**
 * Combine Adobe, Ajv, and business validation
 */
export async function validateJsonLdComplete(
  jsonLd: object,
  businessOptions?: Parameters<typeof validateBusinessRules>[1]
): Promise<ValidationReport> {
  const [adobeResult, ajvResult, businessResult] = await Promise.all([
    validateJsonLd(jsonLd),
    Promise.resolve(validateWithAjv(jsonLd)),
    validateBusinessRules(jsonLd, businessOptions),
  ]);

  return {
    adobe: adobeResult,
    ajv: ajvResult,
    custom: businessResult,
  };
}

/**
 * Validate extracted structured data from HTML
 */
export async function validateExtractedData(
  extractedData: {
    all: unknown[];
    jsonLd: unknown[];
    locations?: Record<string, unknown>;
  },
  schemaOrgJson?: unknown
): Promise<ValidationReport> {
  try {
    // Combine extracted data for validation
    let dataToValidate: unknown;
    
    if (extractedData.all.length === 0) {
      // No structured data found
      return {
        adobe: {
          valid: false,
          errors: [
            {
              message: "No structured data found in HTML",
              type: "NO_DATA",
            },
          ],
          warnings: [],
          timestamp: new Date().toISOString(),
        },
        custom: {
          errors: ["No structured data (JSON-LD, Microdata, or RDFa) found"],
          warnings: [],
          info: [],
        },
      };
    }

    // Use @graph format for multiple items
    if (extractedData.all.length === 1) {
      dataToValidate = extractedData.all[0];
    } else {
      dataToValidate = {
        "@context": "https://schema.org",
        "@graph": extractedData.all,
      };
    }

    // Validate using Adobe validator
    const adobeResult = await validateJsonLd(dataToValidate as object);

    // Enhance errors with location information if available
    if (extractedData.locations) {
      adobeResult.errors = adobeResult.errors.map((err) => ({
        ...err,
        path: err.path || (extractedData.locations?.[err.property || ""] as string),
      }));
      
      adobeResult.warnings = adobeResult.warnings.map((warn) => ({
        ...warn,
        path: warn.path || (extractedData.locations?.[warn.property || ""] as string),
      }));
    }

    // Run business rules validation
    const businessResult = await validateBusinessRules(dataToValidate as object);

    return {
      adobe: adobeResult,
      custom: businessResult,
    };
  } catch (error) {
    return {
      adobe: {
        valid: false,
        errors: [
          {
            message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
            type: "VALIDATION_FAILED",
          },
        ],
        warnings: [],
        timestamp: new Date().toISOString(),
      },
      custom: {
        errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`],
        warnings: [],
        info: [],
      },
    };
  }
}

/**
 * Validate full HTML page
 * This is a convenience wrapper that combines extraction and validation
 */
export async function validateFullPageHTML(
  html: string,
  options?: {
    requirePublisherLogo?: boolean;
    requireHeroImage?: boolean;
    requireAuthorBio?: boolean;
    minHeadlineLength?: number;
    maxHeadlineLength?: number;
  }
): Promise<ValidationReport> {
  try {
    // Import extractor dynamically to avoid loading issues
    const { extractStructuredData, combineExtractedData } = await import("./page-extractor");
    
    // Extract structured data from HTML
    const extracted = await extractStructuredData(html);
    
    // Combine into validator format
    const combined = combineExtractedData(extracted);
    
    // Validate combined data
    return await validateJsonLdComplete(combined as object, options);
  } catch (error) {
    return {
      adobe: {
        valid: false,
        errors: [
          {
            message: `Page validation failed: ${error instanceof Error ? error.message : String(error)}`,
            type: "PAGE_VALIDATION_FAILED",
          },
        ],
        warnings: [],
        timestamp: new Date().toISOString(),
      },
      custom: {
        errors: [`Page validation error: ${error instanceof Error ? error.message : String(error)}`],
        warnings: [],
        info: [],
      },
    };
  }
}

/**
 * Get human-readable validation summary
 */
export function getValidationSummary(report: ValidationReport): string {
  const parts: string[] = [];

  if (report.adobe) {
    if (report.adobe.valid) {
      parts.push("✅ Schema.org validation passed");
    } else {
      parts.push(`❌ ${report.adobe.errors.length} schema error(s)`);
    }
    if (report.adobe.warnings.length > 0) {
      parts.push(`⚠️ ${report.adobe.warnings.length} warning(s)`);
    }
  }

  if (report.custom) {
    if (report.custom.errors.length > 0) {
      parts.push(`❌ ${report.custom.errors.length} business error(s)`);
    }
    if (report.custom.warnings.length > 0) {
      parts.push(`⚠️ ${report.custom.warnings.length} business warning(s)`);
    }
  }

  return parts.join(" | ");
}
