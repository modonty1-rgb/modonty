/**
 * Client JSON-LD Storage System
 *
 * Handles:
 * - Generating and saving JSON-LD for clients to database
 * - Cache invalidation and regeneration
 * - Validation with Adobe, Ajv, and business rules
 * - Performance tracking
 */

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { generateCompleteOrganizationJsonLd } from "@/lib/seo/generate-complete-organization-jsonld";
import {
  validateClientJsonLdComplete,
} from "./client-jsonld-validator";
import { normalizeJsonLd } from "@/lib/seo/jsonld-processor";
import type { JsonLdGraph } from "@/lib/seo/knowledge-graph-generator";
import type { ValidationReport } from "@/lib/seo/jsonld-validator";

// Result of JSON-LD generation
export interface ClientJsonLdGenerationResult {
  success: boolean;
  jsonLd?: object;
  jsonLdString?: string;
  validationReport?: ValidationReport;
  error?: string;
}

/**
 * Type for client with all relations needed for JSON-LD generation
 */
export interface ClientWithFullRelations {
  id: string;
  name: string;
  slug: string;
  legalName: string | null;
  alternateName: string | null;
  url: string | null;
  email: string;
  phone: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  description: string | null;
  businessBrief: string | null;
  targetAudience: string | null;
  contentPriorities: string[];
  keywords: string[];
  knowsLanguage: string[];
  contactType: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressCountry: string | null;
  addressPostalCode: string | null;
  addressRegion: string | null;
  addressNeighborhood: string | null;
  addressBuildingNumber: string | null;
  addressAdditionalNumber: string | null;
  addressLatitude: number | null;
  addressLongitude: number | null;
  sameAs: string[];
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterSite: string | null;
  canonicalUrl: string | null;
  foundingDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  commercialRegistrationNumber: string | null;
  vatID: string | null;
  taxID: string | null;
  legalForm: string | null;
  businessActivityCode: string | null;
  isicV4: string | null;
  numberOfEmployees: string | null;
  licenseNumber: string | null;
  licenseAuthority: string | null;
  slogan: string | null;
  organizationType: string | null;
  parentOrganizationId: string | null;
  logoMedia?: {
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
  } | null;
  ogImageMedia?: {
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
  } | null;
  twitterImageMedia?: {
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
  } | null;
  industry?: {
    id: string;
    name: string;
  } | null;
  parentOrganization?: {
    id: string;
    name: string;
    url: string | null;
    slug: string | null;
  } | null;
}

/**
 * Fetch client with all relations needed for JSON-LD generation
 */
export async function fetchClientForJsonLd(
  clientId: string
): Promise<ClientWithFullRelations | null> {
  return db.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      slug: true,
      legalName: true,
      alternateName: true,
      url: true,
      email: true,
      phone: true,
      seoTitle: true,
      seoDescription: true,
      description: true,
      businessBrief: true,
      targetAudience: true,
      contentPriorities: true,
      keywords: true,
      knowsLanguage: true,
      contactType: true,
      addressStreet: true,
      addressCity: true,
      addressCountry: true,
      addressPostalCode: true,
      addressRegion: true,
      addressNeighborhood: true,
      addressBuildingNumber: true,
      addressAdditionalNumber: true,
      addressLatitude: true,
      addressLongitude: true,
      sameAs: true,
      twitterCard: true,
      twitterTitle: true,
      twitterDescription: true,
      twitterSite: true,
      canonicalUrl: true,
      foundingDate: true,
      createdAt: true,
      updatedAt: true,
      commercialRegistrationNumber: true,
      vatID: true,
      taxID: true,
      legalForm: true,
      businessActivityCode: true,
      isicV4: true,
      numberOfEmployees: true,
      licenseNumber: true,
      licenseAuthority: true,
      slogan: true,
      organizationType: true,
      parentOrganizationId: true,
      logoMedia: {
        select: {
          url: true,
          altText: true,
          width: true,
          height: true,
        },
      },
      ogImageMedia: {
        select: {
          url: true,
          altText: true,
          width: true,
          height: true,
        },
      },
      twitterImageMedia: {
        select: {
          url: true,
          altText: true,
          width: true,
          height: true,
        },
      },
      industry: {
        select: {
          id: true,
          name: true,
        },
      },
      parentOrganization: {
        select: {
          id: true,
          name: true,
          url: true,
          slug: true,
        },
      },
    },
  });
}

/**
 * Generate and save JSON-LD for a client
 */
export async function generateAndSaveClientJsonLd(
  clientId: string
): Promise<ClientJsonLdGenerationResult> {
  try {
    // Fetch client with all relations
    const client = await fetchClientForJsonLd(clientId);

    if (!client) {
      return {
        success: false,
        error: "Client not found",
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
    const clientPageUrl = client.canonicalUrl || `${siteUrl}/clients/${client.slug}`;

    // Generate knowledge graph
    const knowledgeGraph = generateCompleteOrganizationJsonLd(client as any, clientPageUrl);

    // Normalize JSON-LD structure (ensures consistency)
    const normalizedGraph = await normalizeJsonLd(knowledgeGraph);

    // Validate (Adobe + Ajv + business rules)
    const validationReport = await validateClientJsonLdComplete(normalizedGraph, {
      requireLogo: true, // Require logo for Organization rich results
      requireAddress: false, // Address optional but validated if present
      requireContactPoint: false, // ContactPoint optional but validated if present
      minNameLength: 2,
      maxNameLength: 100,
    });

    // Stringify normalized graph for storage
    const jsonLdString = JSON.stringify(normalizedGraph, null, 2);

    // Save to database
    await db.client.update({
      where: { id: clientId },
      data: {
        jsonLdStructuredData: jsonLdString,
        jsonLdLastGenerated: new Date(),
        jsonLdValidationReport: JSON.parse(
          JSON.stringify(validationReport)
        ) as Prisma.InputJsonValue,
      },
    });

    return {
      success: true,
      jsonLd: knowledgeGraph,
      jsonLdString,
      validationReport,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Regenerate JSON-LD for a client (alias for generateAndSaveClientJsonLd)
 */
export async function regenerateClientJsonLd(
  clientId: string
): Promise<ClientJsonLdGenerationResult> {
  return generateAndSaveClientJsonLd(clientId);
}

/**
 * Get cached JSON-LD from database
 */
export async function getCachedClientJsonLd(
  clientId: string
): Promise<{ jsonLd: object | null; validationReport: ValidationReport | null }> {
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: {
      jsonLdStructuredData: true,
      jsonLdValidationReport: true,
    },
  });

  if (!client) {
    return { jsonLd: null, validationReport: null };
  }

  let jsonLd: object | null = null;
  if (client.jsonLdStructuredData) {
    try {
      jsonLd = JSON.parse(client.jsonLdStructuredData);
    } catch {
      jsonLd = null;
    }
  }

  return {
    jsonLd,
    validationReport: client.jsonLdValidationReport as ValidationReport | null,
  };
}

/**
 * Check if JSON-LD needs regeneration
 */
export async function needsClientRegeneration(clientId: string): Promise<boolean> {
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: {
      jsonLdLastGenerated: true,
      updatedAt: true,
    },
  });

  if (!client) {
    return false;
  }

  // Needs regeneration if never generated or client modified after last generation
  if (!client.jsonLdLastGenerated) {
    return true;
  }

  return client.updatedAt > client.jsonLdLastGenerated;
}
