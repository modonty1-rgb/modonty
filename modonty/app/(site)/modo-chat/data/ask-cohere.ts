import "server-only";

import { getCohereClient, CHAT_MODEL, type ChatMessage, type DocumentForChat } from "./cohere-client";

/** One answer, no streaming. Cohere v2 accepts documents as plain strings. */
export async function askCohere(messages: ChatMessage[], documents?: DocumentForChat[]) {
  const cohere = getCohereClient();
  const formatted = messages.map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));
  const docPayload = documents?.length ? documents.map((d) => d.text) : undefined;
  const response = await cohere.chat({
    model: CHAT_MODEL,
    messages: formatted,
    ...(docPayload && { documents: docPayload }),
  });
  return response;
}
