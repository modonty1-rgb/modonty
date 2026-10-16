import "server-only";

import { getCohereClient, EMBED_MODEL } from "./cohere-client";

/**
 * Cohere rejects more than 96 texts in one embed call:
 * "Maximum number of texts per call is `96`" — cohere-ai/api/.../V2EmbedRequest.d.ts.
 * A category with enough articles blows past that, so batch instead of failing the request.
 */
const MAX_TEXTS_PER_CALL = 96;

/**
 * Embed texts for semantic search.
 * Use input_type "search_document" for indexing, "search_query" for queries.
 */
export async function embedTexts(
  texts: string[],
  inputType: "search_document" | "search_query" = "search_document"
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const cohere = getCohereClient();
  const batches: string[][] = [];
  for (let i = 0; i < texts.length; i += MAX_TEXTS_PER_CALL) {
    batches.push(texts.slice(i, i + MAX_TEXTS_PER_CALL));
  }

  const results = await Promise.all(
    batches.map(async (batch) => {
      const response = await cohere.embed({ model: EMBED_MODEL, inputType, texts: batch });
      // Indexing is the only embed that grows with the library — its billed tokens are logged so
      // the cost is read from the vendor's own count, not estimated (Khalid, 16 Oct 2026: «هل في تكاليف؟»).
      if (inputType === "search_document") {
        const billed = (response.meta as { billedUnits?: { inputTokens?: number } } | undefined)?.billedUnits?.inputTokens;
        console.info("[embed] indexed", batch.length, "texts · billed input tokens:", billed ?? "n/a");
      }
      const emb = response.embeddings as { float?: number[][] };
      return (emb.float ?? []) as number[][];
    })
  );

  // Order matters — callers pair embeddings with their input by index.
  return results.flat();
}
