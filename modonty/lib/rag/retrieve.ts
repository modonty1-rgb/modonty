import "server-only";
import { embed, rerank, type DocumentForChat } from "@/lib/cohere";

const RETRIEVE_TOP_K = 10;
const RERANK_TOP_N = 3;
const RELEVANCE_THRESHOLD = 0.25;

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

/**
 * Retrieve top chunks by embedding similarity, then rerank.
 * Returns documents formatted for Cohere Chat.
 */
export async function retrieveFromChunks(
  query: string,
  chunks: string[]
): Promise<{ docs: DocumentForChat[]; topScore: number; topRerankScore: number }> {
  if (chunks.length === 0) {
    return { docs: [], topScore: 0, topRerankScore: 0 };
  }

  const [queryEmb, chunkEmbs] = await Promise.all([
    embed([query], "search_query"),
    embed(chunks, "search_document"),
  ]);

  if (!queryEmb?.[0] || !chunkEmbs?.length) {
    return { docs: [], topScore: 0, topRerankScore: 0 };
  }

  const scored = chunks
    .map((chunk, i) => ({
      chunk,
      score: cosineSimilarity(queryEmb[0], chunkEmbs[i] ?? []),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, RETRIEVE_TOP_K);

  const topScore = scored[0]?.score ?? 0;
  if (topScore < RELEVANCE_THRESHOLD) {
    return { docs: [], topScore, topRerankScore: 0 };
  }

  const toRerank = scored.map((s) => s.chunk);
  const reranked = await rerank(query, toRerank, Math.min(RERANK_TOP_N, toRerank.length));

  const first = reranked[0] as { relevanceScore?: number; relevance_score?: number } | undefined;
  const topRerankScore = first?.relevanceScore ?? first?.relevance_score ?? topScore;

  const docs: DocumentForChat[] = reranked.map((r, i) => ({
    id: `doc-${i}`,
    text: toRerank[r.index] ?? "",
  }));

  return { docs, topScore, topRerankScore };
}
