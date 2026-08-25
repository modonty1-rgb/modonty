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
import type { YmylCategory } from "@modonty/shared/lib/seo/ymyl-config";

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
 * The @ids the rest of the graph already uses for these entities.
 *
 * These nodes describe the SAME clinic and the SAME page the main generator describes, so
 * they must carry the same identifiers or they arrive as extra entities. Before this,
 * `@id` was rebuilt here from `client.url` and `pageUrl + "#webpage"`, which put a second
 * page node next to the real one — measured on /articles/علاج-الديسك:
 * `WebPage @id .../علاج-الديسك` and `MedicalWebPage @id .../علاج-الديسك#webpage`, with
 * `reviewedBy` sitting on the second. Passing the ids in is what keeps them one node.
 */
export interface YmylGraphIds {
  /** @id of the client's Organization node in the main graph. */
  organization: string;
  /** @id of the page's WebPage node in the main graph. */
  webPage: string;
}

/**
 * Reviewer is ALWAYS a Person. Physician/Attorney are LocalBusiness subtypes in
 * schema.org, so typing a human reviewer with them makes Google's LocalBusiness
 * validation demand telephone/priceRange/address on a person. Google's article
 * guidance expects reviewedBy to be Person or Organization.
 */
function reviewerSchemaType(_category: YmylCategory): string {
  return "Person";
}

/** Build the @graph nodes for a YMYL client + optional reviewer + page context. */
export function buildYmylJsonLdGraph(input: {
  client: YmylClientForJsonLd;
  reviewer?: YmylReviewerForJsonLd | null;
  article?: YmylArticleContext | null;
  ids: YmylGraphIds;
}): Record<string, unknown>[] {
  const { client, reviewer, article, ids } = input;

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
    "@id": ids.organization,
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
    // medicalSpecialty is not a Person property — carry the specialty via knowsAbout
    if (
      client.ymylCategory === "medical" &&
      typeof data.specialty === "string" &&
      !reviewerNode.knowsAbout
    ) {
      const specialtyField = cfg.fields.find((f) => f.type === "specialty");
      const match = specialtyField?.specialties?.find((s) => s.value === data.specialty);
      if (match) reviewerNode.knowsAbout = [match.label.en];
    }
    graph.push(reviewerNode);
  }

  // MedicalWebPage wrapper (medical only) — reviewedBy + lastReviewed live HERE,
  // not on Article (per schema.org).
  if (article && client.ymylCategory === "medical") {
    const webPageNode: Record<string, unknown> = {
      "@type": "MedicalWebPage",
      "@id": ids.webPage,
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
