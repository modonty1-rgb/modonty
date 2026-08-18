import "server-only";

import { embedTexts } from "./embed-texts";
import { rerankDocuments } from "./rerank-documents";
import type { DocumentForChat } from "./cohere-client";
import type { EmbeddedChunk } from "./get-embedded-chunks";

const RETRIEVE_TOP_K = 10;
const RERANK_TOP_N = 3;
const RELEVANCE_THRESHOLD = 0.25;
/**
 * Floor for a reranked chunk to count as a match at all.
 * PROVISIONAL: the vendor states relevance scores are query-dependent and not comparable
 * across queries, and prescribes calibrating on 30–50 representative questions instead of
 * guessing. That calibration has not been run — treat this number as a placeholder, not a
 * tuned value, and expect it to move once real Arabic questions are measured.
 */
const RERANK_MIN_SCORE = 0.3;

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export interface RetrievalResult {
  docs: DocumentForChat[];
  topScore: number;
  topRerankScore: number;
  /** The articles the winning chunks came from — lets the answer cite and link its sources. */
  matchedArticleIds: string[];
  /**
   * The closest article even when it did not clear the answer floor, with its score. Too weak
   * to answer from, but the honest candidate for «هل تريد قراءة أعمق؟» — which previously
   * offered the most-VIEWED article in the scope, i.e. a herniated-disc piece under a
   * rhinoplasty answer (measured live, 2026-08-18).
   */
  bestArticleId: string | null;
  bestArticleScore: number;
}

/**
 * Scores a question against ALREADY-EMBEDDED chunks, so the only paid embedding per question
 * is the question itself. Scoring runs in application code, which the vendor documents as the
 * right trade-off while the corpus is small; a vector index replaces this line-for-line later.
 */
export async function retrieveFromEmbedded(
  query: string,
  chunks: EmbeddedChunk[]
): Promise<RetrievalResult> {
  const empty: RetrievalResult = {
    docs: [],
    topScore: 0,
    topRerankScore: 0,
    matchedArticleIds: [],
    bestArticleId: null,
    bestArticleScore: 0,
  };
  if (chunks.length === 0) return empty;

  const [queryEmb] = await embedTexts([query], "search_query");
  if (!queryEmb) return empty;

  const scored = chunks
    .map((chunk) => ({ chunk, score: cosineSimilarity(queryEmb, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, RETRIEVE_TOP_K);

  const topScore = scored[0]?.score ?? 0;
  if (topScore < RELEVANCE_THRESHOLD) {
    return { ...empty, topScore };
  }

  const toRerank = scored.map((s) => s.chunk);
  const reranked = await rerankDocuments(
    query,
    toRerank.map((c) => c.text),
    Math.min(RERANK_TOP_N, toRerank.length)
  );

  const first = reranked[0] as { relevanceScore?: number; relevance_score?: number; index: number } | undefined;
  const topRerankScore = first?.relevanceScore ?? first?.relevance_score ?? topScore;
  const bestArticleId = first ? toRerank[first.index]?.articleId ?? null : null;

  const docs: DocumentForChat[] = [];
  const matchedArticleIds: string[] = [];
  reranked.forEach((r, i) => {
    const chunk = toRerank[r.index];
    if (!chunk) return;
    // The reranker returns its top N whatever their scores, so with no floor a category with
    // any sibling article always produced "matches" — including plainly irrelevant ones.
    const score = (r as { relevanceScore?: number; relevance_score?: number }).relevanceScore
      ?? (r as { relevance_score?: number }).relevance_score
      ?? 0;
    if (score < RERANK_MIN_SCORE) return;
    docs.push({ id: `doc-${i}`, text: chunk.text });
    if (!matchedArticleIds.includes(chunk.articleId)) matchedArticleIds.push(chunk.articleId);
  });

  return { docs, topScore, topRerankScore, matchedArticleIds, bestArticleId, bestArticleScore: topRerankScore };
}
