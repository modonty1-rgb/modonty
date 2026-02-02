/**
 * Client JSON-LD Validator
 *
 * Client-specific JSON-LD validation for Organization schema.
 * Uses Adobe validator from shared lib (read-only) and adds:
 * - Organization schema for Ajv validation
 * - Client-specific business rules
 */

import Ajv from "ajv";
import addFormats from "ajv-formats";
import { validateJsonLd, type ValidationResult, type ValidationReport } from "@/lib/seo/jsonld-validator";

/**
 * Business rules validation result
 */
export interface ClientBusinessValidationResult {
  errors: string[];
  warnings: string[];
  info: string[];
}

/**
 * Ajv instance for Organization schema validation
 */
const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

/**
 * Organization JSON Schema for Ajv validation
 * Type-specific validation for Organization JSON-LD structure
 */
const organizationSchema = {
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
              properties: { 
                "@type": { 
                  enum: [
                    "Organization", 
                    "Corporation", 
                    "LocalBusiness", 
                    "NonProfit", 
                    "EducationalOrganization", 
                    "GovernmentOrganization", 
                    "SportsOrganization", 
                    "NGO"
                  ] 
                } 
              }
            },
            then: {
              required: ["@id", "name"],
              properties: {
                name: {
                  type: "string",
                  minLength: 2,
                  maxLength: 100,
                },
                legalName: { type: "string" },
                alternateName: { type: "string" },
                url: {
                  type: "string",
                  format: "uri",
                },
                logo: {
                  type: "object",
                  properties: {
                    "@type": { const: "ImageObject" },
                    url: { type: "string", format: "uri" },
                    width: { type: "number", minimum: 112 },
                    height: { type: "number", minimum: 112 },
                  },
                },
                description: { type: "string" },
                address: {
                  type: "object",
                  properties: {
                    "@type": { const: "PostalAddress" },
                    streetAddress: { type: "string" },
                    addressLocality: { type: "string" },
                    addressCountry: { type: "string" },
                    postalCode: { type: "string" },
                  },
                },
                contactPoint: {
                  oneOf: [
                    {
                      type: "object",
                      properties: {
                        "@type": { const: "ContactPoint" },
                        email: { type: "string", format: "email" },
                        telephone: { type: "string" },
                        contactType: { type: "string" },
                        areaServed: { type: "string" },
                        availableLanguage: {
                          type: "array",
                          items: { type: "string" },
                        },
                      },
                    },
                    {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          "@type": { const: "ContactPoint" },
                        },
                      },
                    },
                  ],
                },
                sameAs: {
                  type: "array",
                  items: {
                    type: "string",
                    format: "uri",
                  },
                },
                foundingDate: {
                  type: "string",
                  format: "date",
                },
              }
            }
          },
          {
            if: {
              properties: { "@type": { const: "WebSite" } }
            },
            then: {
              required: ["@id", "url", "name"],
              properties: {
                url: { type: "string", pattern: "^https?://" },
                name: { type: "string", minLength: 1 },
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
          }
        ]
      },
    },
  },
  required: ["@context", "@graph"],
};

const validateOrganizationSchema = ajv.compile(organizationSchema);

/**
 * Validate JSON-LD using Ajv Organization schema
 * Fast validation for Organization structure
 */
export function validateClientWithAjv(jsonLd: object): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const valid = validateOrganizationSchema(jsonLd);

  if (!valid && validateOrganizationSchema.errors) {
    for (const error of validateOrganizationSchema.errors) {
      const message = `${error.instancePath || error.schemaPath}: ${error.message}`;
      if (error.keyword === "required" || error.keyword === "format") {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }
  }

  return { valid, errors, warnings };
}

/**
 * Validate Organization business rules
 */
export async function validateClientBusinessRules(
  jsonLd: object,
  options?: {
    requireLogo?: boolean;
    requireAddress?: boolean;
    requireContactPoint?: boolean;
    minNameLength?: number;
    maxNameLength?: number;
  }
): Promise<ClientBusinessValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  const opts = {
    requireLogo: false,
    requireAddress: false,
    requireContactPoint: false,
    minNameLength: 2,
    maxNameLength: 100,
    ...options,
  };

  // Extract graph from JSON-LD
  const graph = (jsonLd as { "@graph"?: unknown[] })["@graph"];
  if (!graph || !Array.isArray(graph)) {
    errors.push("JSON-LD must contain @graph array");
    return { errors, warnings, info };
  }

  // Find Organization node
  const organizationNode = graph.find(
    (n: unknown) => {
      const type = (n as { "@type"?: string })["@type"];
      return type === "Organization" || 
             type === "Corporation" || 
             type === "LocalBusiness" || 
             type === "NonProfit" ||
             type === "EducationalOrganization" ||
             type === "GovernmentOrganization" ||
             type === "SportsOrganization" ||
             type === "NGO";
    }
  ) as Record<string, unknown> | undefined;

  if (!organizationNode) {
    errors.push("Missing Organization node in @graph");
    return { errors, warnings, info };
  }

  // Check name
  const name = organizationNode.name as string | undefined;
  if (!name) {
    errors.push("Missing name in Organization (required)");
  } else {
    if (name.length < opts.minNameLength) {
      errors.push(`Organization name too short (${name.length} chars). Minimum: ${opts.minNameLength} chars`);
    }
    if (name.length > opts.maxNameLength) {
      warnings.push(`Organization name may be too long (${name.length} chars). Maximum recommended: ${opts.maxNameLength} chars`);
    }
  }

  // Check logo
  if (opts.requireLogo && !organizationNode.logo) {
    errors.push("Logo missing (required for Organization rich results)");
  } else if (organizationNode.logo) {
    const logo = organizationNode.logo as Record<string, unknown> | undefined;
    if (logo) {
      const logoWidth = logo.width as number | undefined;
      const logoHeight = logo.height as number | undefined;
      if (logoWidth && logoWidth < 112) {
        warnings.push(`Logo width too small (${logoWidth}px). Recommended: 112px minimum`);
      }
      if (logoHeight && logoHeight < 112) {
        warnings.push(`Logo height too small (${logoHeight}px). Recommended: 112px minimum`);
      }
    }
  }

  // Check URL format
  if (organizationNode.url) {
    const url = organizationNode.url as string;
    try {
      new URL(url);
    } catch {
      errors.push(`Invalid URL format: ${url}`);
    }
  }

  // Check address if required
  if (opts.requireAddress && !organizationNode.address) {
    errors.push("Address missing (required for LocalBusiness)");
  } else if (organizationNode.address) {
    const address = organizationNode.address as Record<string, unknown> | undefined;
    if (address) {
      if (!address.addressLocality && !address.streetAddress) {
        warnings.push("Address incomplete: missing city or street address");
      }
      if (!address.addressCountry) {
        warnings.push("Address incomplete: missing country");
      }
    }
  }

  // Check contactPoint if required
  if (opts.requireContactPoint && !organizationNode.contactPoint) {
    errors.push("ContactPoint missing (required for Organization)");
  } else if (organizationNode.contactPoint) {
    const contactPoint = organizationNode.contactPoint;
    if (Array.isArray(contactPoint)) {
      if (contactPoint.length === 0) {
        errors.push("ContactPoint array is empty");
      }
    } else if (typeof contactPoint === "object") {
      const cp = contactPoint as Record<string, unknown>;
      if (cp.email) {
        const email = cp.email as string;
        if (!email.includes("@")) {
          errors.push(`Invalid email format in ContactPoint: ${email}`);
        }
      }
      if (cp.telephone && typeof cp.telephone === "string") {
        // Basic phone validation
        const phone = cp.telephone.replace(/\s+/g, "");
        if (phone.length < 8) {
          warnings.push(`Phone number seems too short: ${cp.telephone}`);
        }
      }
    }
  }

  // Check sameAs URLs
  if (organizationNode.sameAs && Array.isArray(organizationNode.sameAs)) {
    for (const url of organizationNode.sameAs) {
      if (typeof url === "string") {
        try {
          new URL(url);
        } catch {
          errors.push(`Invalid sameAs URL format: ${url}`);
        }
      }
    }
  }

  // Check description
  if (!organizationNode.description) {
    warnings.push("Description missing (recommended for SEO)");
  } else {
    const desc = organizationNode.description as string;
    if (desc.length < 100) {
      warnings.push(`Description too short (${desc.length} chars). Recommended: 100+ chars`);
    }
  }

  return { errors, warnings, info };
}

/**
 * Complete validation for client JSON-LD
 * Combines Adobe validator, Ajv validation, and business rules
 */
export async function validateClientJsonLdComplete(
  jsonLd: object,
  businessOptions?: Parameters<typeof validateClientBusinessRules>[1]
): Promise<ValidationReport> {
  const [adobeResult, ajvResult, businessResult] = await Promise.all([
    validateJsonLd(jsonLd),
    Promise.resolve(validateClientWithAjv(jsonLd)),
    validateClientBusinessRules(jsonLd, businessOptions),
  ]);

  return {
    adobe: adobeResult,
    ajv: ajvResult,
    custom: businessResult,
  };
}
