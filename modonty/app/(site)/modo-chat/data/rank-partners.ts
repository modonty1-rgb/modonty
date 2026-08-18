import "server-only";

import { rerankDocuments } from "./rerank-documents";


import type { PartnerForCard } from "./get-industry-scope";

export type RankablePartner = PartnerForCard;

/** Below this a partner is not plausibly related to the question and is not offered at all. */
const MIN_RELEVANCE = 0.05;

/**
 * Picks the partners actually related to a question, when no article covers it.
 *
 * Offering the alphabetically-first three was measured live on 2026-08-18: a rhinoplasty
 * question was answered with three pain-management clinics under the line «شركاء يقدرون
 * يخدمونك». A recommendation nobody can act on is worse than none — it spends the trust the
 * answer just earned.
 *
 * The partner's own words (name, description, slogan) are ranked against the question by the
 * same reranker retrieval uses. Failure is not fatal: ranking is an improvement over the
 * alphabetical list, so if the call fails we fall back to it rather than dropping the answer.
 */
export async function rankPartners(
  query: string,
  partners: RankablePartner[],
  topN = 3
): Promise<RankablePartner[]> {
  if (partners.length <= 1) return partners;

  const documents = partners.map((p) =>
    [p.name, p.slogan, p.description].filter(Boolean).join(" — ")
  );

  try {
    const results = await rerankDocuments(query, documents, Math.min(topN, partners.length));
    const ranked = results
      .filter((r) => r.relevanceScore >= MIN_RELEVANCE)
      .map((r) => partners[r.index])
      .filter((p): p is RankablePartner => Boolean(p));
    return ranked;
  } catch {
    return partners.slice(0, topN);
  }
}
