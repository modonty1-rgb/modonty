import "server-only";
import { CohereClientV2 } from "cohere-ai";

function getCohereClient() {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    throw new Error("COHERE_API_KEY is required for the article chatbot");
  }
  return new CohereClientV2({ token: apiKey });
}

const EMBED_MODEL = "embed-multilingual-v3.0";
const RERANK_MODEL = "rerank-multilingual-v3.0";
const CHAT_MODEL = "command-r-plus-08-2024";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };
export type DocumentForChat = { id: string; text: string };

/**
 * Embed texts for semantic search.
 * Use input_type "search_document" for indexing, "search_query" for queries.
 */
export async function embed(
  texts: string[],
  inputType: "search_document" | "search_query" = "search_document"
) {
  const cohere = getCohereClient();
  const response = await cohere.embed({
    model: EMBED_MODEL,
    inputType,
    texts,
  });
  const emb = response.embeddings as { float?: number[][] };
  return (emb.float ?? []) as number[][];
}

/**
 * Rerank documents by relevance to the query.
 */
export async function rerank(query: string, documents: string[], topN = 5) {
  const cohere = getCohereClient();
  const response = await cohere.rerank({
    model: RERANK_MODEL,
    query,
    documents,
    topN,
  });
  return response.results;
}

/**
 * Chat with optional documents (RAG).
 * Cohere v2 accepts documents as plain strings.
 */
export async function chat(
  messages: ChatMessage[],
  documents?: DocumentForChat[]
) {
  const cohere = getCohereClient();
  const formatted = messages.map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));
  const docPayload = documents?.length
    ? documents.map((d) => d.text)
    : undefined;
  const response = await cohere.chat({
    model: CHAT_MODEL,
    messages: formatted,
    ...(docPayload && { documents: docPayload }),
  });
  return response;
}

/**
 * Stream chat response. Yields text deltas.
 * Cohere v2 uses type "content-delta" and delta.message.content.text.
 */
export async function* chatStream(
  messages: ChatMessage[],
  documents?: DocumentForChat[]
) {
  const cohere = getCohereClient();
  const formatted = messages.map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));
  const docPayload = documents?.length
    ? documents.map((d) => d.text)
    : undefined;
  const response = await cohere.chatStream({
    model: CHAT_MODEL,
    messages: formatted,
    ...(docPayload && { documents: docPayload }),
  });

  for await (const event of response) {
    if (event.type === "content-delta") {
      const text = event.delta?.message?.content?.text;
      if (text) yield text;
    }
  }
}
