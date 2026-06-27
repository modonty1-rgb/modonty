/**
 * Build the YMYL-aware schema.org JSON-LD nodes for a client + article.
 *
 * Returns a partial @graph that the main JSON-LD generator can merge with
 * the standard Article/WebPage/Organization graph.
 *
 * Schema.org reference:
 * - MedicalWebPage: https://schema.org/MedicalWebPage (reviewedBy lives here, not on Article)
 * - MedicalClinic / Hospital / Dentist / Pharmacy: https://schema.org/MedicalOrganization
 * - LegalService: https://schema.org/LegalService
 * - FinancialService: https://schema.org/FinancialService
 * - Physician / Attorney: https://schema.org/Physician, https://schema.org/Attorney
 */

import { getYmylConfig, resolveYmylSchemaType } from "./ymyl-helpers";
import type { YmylCategory } from "@modonty/database/lib/seo/ymyl-config";

export interface YmylClientForJsonLd {
  id: string;
  name: string;
  url?: string | null;
  isYmyl: boolean;
  ymylCategory: string | null;
  ymylData: unknown;
  addressCountry?: string | null;
}

export interface YmylReviewerForJsonLd {
  id: string;
  name: string;
  jobTitle?: string | null;
  credentials?: string[];
  qualifications?: string[];
  expertiseAreas?: string[];
  profileUrl?: string | null;
  imageUrl?: string | null;
}

export interface YmylArticleContext {
  /** Canonical URL of the article page */
  pageUrl: string;
  /** YYYY-MM-DD ISO string */
  lastReviewedIso?: string | null;
}

/**
 * Map category → schema.org Person sub-type for the reviewer.
 * Medical reviewers → Physician, Legal → Attorney, Financial → Person.
 */
function reviewerSchemaType(category: YmylCategory): string {
  switch (category) {
    case "medical":
      return "Physician";
    case "legal":
      return "Attorney";
    case "financial":
      return "Person"; // schema.org has no FinancialAdvisor type — use Person + jobTitle
  }
}

/** Build the @graph nodes for a YMYL client + optional reviewer + page context. */
export function buildYmylJsonLdGraph(input: {
  client: YmylClientForJsonLd;
  reviewer?: YmylReviewerForJsonLd | null;
  article?: YmylArticleContext | null;
}): Record<string, unknown>[] {
  const { client, reviewer, article } = input;

  if (!client.isYmyl) return [];

  const cfg = getYmylConfig(client.ymylCategory);
  if (!cfg) return [];

  const data = (client.ymylData && typeof client.ymylData === "object"
    ? client.ymylData
    : {}) as Record<string, unknown>;

  const orgSchemaType = resolveYmylSchemaType(client.ymylCategory, data) ?? cfg.schemaType;

  // Build the organization node (MedicalClinic / LegalService / FinancialService / etc.)
  const orgNode: Record<string, unknown> = {
    "@type": orgSchemaType,
    "@id": `${client.url ?? ""}#organization`,
    name: client.name,
  };
  if (client.url) orgNode.url = client.url;

  // Extract license identifier from ymylData based on category
  const licenseValue = pickLicenseValue(client.ymylCategory, data);
  const authorityValue = pickAuthorityValue(client.ymylCategory, data);
  if (licenseValue && authorityValue) {
    orgNode.identifier = {
      "@type": "PropertyValue",
      propertyID: authorityValue,
      value: licenseValue,
    };
  }
  if (client.addressCountry) {
    orgNode.areaServed = {
      "@type": "Country",
      name: client.addressCountry,
    };
  }
  // medicalSpecialty (only for medical organizations)
  if (client.ymylCategory === "medical" && typeof data.specialty === "string") {
    const specialtyField = cfg.fields.find((f) => f.type === "specialty");
    const match = specialtyField?.specialties?.find((s) => s.value === data.specialty);
    if (match) orgNode.medicalSpecialty = match.label.en;
  }

  const graph: Record<string, unknown>[] = [orgNode];

  // Reviewer node (Physician / Attorney / Person)
  let reviewerNodeId: string | null = null;
  if (reviewer && client.ymylCategory) {
    reviewerNodeId = `${article?.pageUrl ?? client.url ?? ""}#reviewer-${reviewer.id}`;
    const reviewerNode: Record<string, unknown> = {
      "@type": reviewerSchemaType(client.ymylCategory as YmylCategory),
      "@id": reviewerNodeId,
      name: reviewer.name,
    };
    if (reviewer.jobTitle) reviewerNode.jobTitle = reviewer.jobTitle;
    if (reviewer.profileUrl) reviewerNode.url = reviewer.profileUrl;
    if (reviewer.imageUrl) reviewerNode.image = reviewer.imageUrl;
    if (reviewer.expertiseAreas && reviewer.expertiseAreas.length > 0) {
      reviewerNode.knowsAbout = reviewer.expertiseAreas;
    }
    // hasCredential: structured EducationalOccupationalCredential nodes
    const credentialNames = [
      ...(reviewer.credentials ?? []),
      ...(reviewer.qualifications ?? []),
    ].filter((c) => typeof c === "string" && c.trim().length > 0);
    if (credentialNames.length > 0) {
      reviewerNode.hasCredential = credentialNames.map((name) => ({
        "@type": "EducationalOccupationalCredential",
        name,
      }));
    }
    // medicalSpecialty on reviewer when category is medical
    if (client.ymylCategory === "medical" && typeof data.specialty === "string") {
      const specialtyField = cfg.fields.find((f) => f.type === "specialty");
      const match = specialtyField?.specialties?.find((s) => s.value === data.specialty);
      if (match) reviewerNode.medicalSpecialty = match.label.en;
    }
    graph.push(reviewerNode);
  }

  // MedicalWebPage wrapper (medical only) — reviewedBy + lastReviewed live HERE,
  // not on Article (per schema.org).
  if (article && client.ymylCategory === "medical") {
    const webPageNode: Record<string, unknown> = {
      "@type": "MedicalWebPage",
      "@id": `${article.pageUrl}#webpage`,
      url: article.pageUrl,
    };
    if (reviewerNodeId) webPageNode.reviewedBy = { "@id": reviewerNodeId };
    if (article.lastReviewedIso) webPageNode.lastReviewed = article.lastReviewedIso;
    graph.push(webPageNode);
  }

  return graph;
}

function pickLicenseValue(
  category: string | null,
  data: Record<string, unknown>
): string | null {
  if (!category) return null;
  const key =
    category === "medical"
      ? "licenseNumber"
      : category === "legal"
        ? "barNumber"
        : category === "financial"
          ? "regulatorLicense"
          : null;
  if (!key) return null;
  const value = data[key];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function pickAuthorityValue(
  category: string | null,
  data: Record<string, unknown>
): string | null {
  if (!category) return null;
  const key =
    category === "medical"
      ? "authority"
      : category === "legal"
        ? "barAssociation"
        : category === "financial"
          ? "regulator"
          : null;
  if (!key) return null;
  const value = data[key];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}
