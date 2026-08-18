import "server-only";

import { getCohereClient, RERANK_MODEL } from "./cohere-client";

/** Rerank documents by relevance to the query. */
export async function rerankDocuments(query: string, documents: string[], topN = 5) {
  const cohere = getCohereClient();
  const response = await cohere.rerank({
    model: RERANK_MODEL,
    query,
    documents,
    topN,
  });
  return response.results;
}
