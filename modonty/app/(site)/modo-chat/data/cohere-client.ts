import "server-only";
import { CohereClientV2 } from "cohere-ai";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };
export type DocumentForChat = { id: string; text: string };

export const EMBED_MODEL = "embed-multilingual-v3.0";
export const RERANK_MODEL = "rerank-multilingual-v3.0";
/**
 * Command R, not R+. Our workload is a three-paragraph answer grounded in supplied documents
 * under four strict prompt rules — which the vendor's own model page calls "simpler retrieval
 * augmented generation" and names as the pick "when price is a major consideration". R+ is
 * listed at $2.50/$10.00 per million tokens and is now filed under legacy models.
 */
export const CHAT_MODEL = "command-r-08-2024";

/** Built per call, not once at module load — the key is read at request time on the server. */
export function getCohereClient() {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    throw new Error("COHERE_API_KEY is required for the article chatbot");
  }
  return new CohereClientV2({ token: apiKey });
}
