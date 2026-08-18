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
  topN = 3,
  /**
   * Pass 0 to keep the ranker's ORDER while ignoring its magnitude. Needed for price and
   * appointment questions: no partner description contains a price, so the ranker honestly
   * scores every one of them near zero (measured 2026-08-19: dental clinics ranked 1-2-3 for
   * «كم سعر زراعة الأسنان» at 0.0000037). The question being asked there is not "does this text
   * answer it" but "who is the right person to ask", and order answers that.
   */
  minRelevance = MIN_RELEVANCE
): Promise<RankablePartner[]> {
  if (partners.length <= 1) return partners;

  const documents = partners.map((p) =>
    [p.name, p.slogan, p.description].filter(Boolean).join(" — ")
  );

  try {
    const results = await rerankDocuments(query, documents, Math.min(topN, partners.length));

    if (process.env.NODE_ENV === "development") {
      // Which partner the ranker actually picked, and how sure it was. Without this an empty
      // result is indistinguishable from a failed call.
      console.debug("[rank-partners]", {
        query: query.slice(0, 50),
        candidates: partners.length,
        floor: minRelevance,
        top: results.slice(0, 3).map((r) => ({
          partner: partners[r.index]?.name?.slice(0, 28),
          score: r.relevanceScore,
        })),
      });
    }

    const ranked = results
      .filter((r) => r.relevanceScore >= minRelevance)
      .map((r) => partners[r.index])
      .filter((p): p is RankablePartner => Boolean(p));
    return ranked;
  } catch {
    return partners.slice(0, topN);
  }
}
