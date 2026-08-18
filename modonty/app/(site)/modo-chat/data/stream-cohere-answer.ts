import "server-only";

import { getCohereClient, CHAT_MODEL, type ChatMessage, type DocumentForChat } from "./cohere-client";

/** Yields text deltas. Cohere v2 uses type "content-delta" and delta.message.content.text. */
export async function* streamCohereAnswer(
  messages: ChatMessage[],
  documents?: DocumentForChat[]
) {
  const cohere = getCohereClient();
  const formatted = messages.map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));
  const docPayload = documents?.length ? documents.map((d) => d.text) : undefined;
  const response = await cohere.chatStream({
    model: CHAT_MODEL,
    messages: formatted,
    ...(docPayload && { documents: docPayload }),
    /**
     * Citations OFF. Passing `documents` turns them on by default, and the model generates them
     * AFTER the text — while the request is still open and still billed.
     *
     * Measured live 2026-08-18 on an article question:
     *   content ends ≈40s → `citation-start@40221ms` → `message-end@70679ms`
     *   `afterLastDeltaMs: 39308`
     * Thirty-nine seconds of silence for data this route never reads: nothing renders citations,
     * and the answer's sources are the partner cards we attach ourselves. It pushed the request
     * past `maxDuration = 60`, so the stream was killed before the `done` frame — the visitor
     * got the whole answer, then «الرد تأخّر», and no partner card.
     *
     * `CitationOptionsMode.Off` is in the installed SDK (cohere-ai types, `CitationOptionsMode`).
     */
    citationOptions: { mode: "OFF" },
  });

  const t0 = Date.now();
  let lastDeltaAt = 0;
  const seen: string[] = [];

  for await (const event of response) {
    if (process.env.NODE_ENV === "development" && event.type !== "content-delta") {
      seen.push(`${event.type}@${Date.now() - t0}ms`);
    }
    if (event.type === "content-delta") {
      const text = event.delta?.message?.content?.text;
      if (text) {
        lastDeltaAt = Date.now();
        yield text;
      }
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[cohere-stream]", {
      totalMs: Date.now() - t0,
      afterLastDeltaMs: lastDeltaAt ? Date.now() - lastDeltaAt : null,
      events: seen,
    });
  }
}
