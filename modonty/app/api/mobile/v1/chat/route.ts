import { answerChatTurn } from "@/app/(site)/modo-chat/data/answer-chat-turn";
import { guardChatRequest } from "@/app/(site)/modo-chat/data/guard-chat-request";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { ACTION_MESSAGES } from "@/lib/mobile-api/messages-actions";

// Worst path is several upstream calls before the first token; the default limit cuts the stream.
export const maxDuration = 60;

/** Only Arabic texts reach the app; the guard's two English ones become the envelope's message. */
function readable(message: unknown): string {
  return typeof message === "string" && /[؀-ۿ]/.test(message) ? message : MESSAGES.invalidBody;
}

/**
 * The web route's JSON answers re-wrapped in the app envelope: 2xx → `{ data: <same body> }`,
 * 4xx → `{ error }` with the web's own Arabic message (and `Retry-After` on 429).
 */
async function toEnvelope(response: Response): Promise<Response> {
  const payload = (await response.json()) as Record<string, unknown>;
  if (response.ok) return ok(payload);
  const message = readable(payload.error);
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    return fail("RATE_LIMITED", message, undefined, retryAfter ? { "Retry-After": retryAfter } : undefined);
  }
  if (response.status === 404) return fail("NOT_FOUND", message);
  if (response.status === 401) return fail("UNAUTHORIZED", message);
  if (response.status >= 500) return fail("INTERNAL_ERROR", MESSAGES.internal);
  return fail("VALIDATION_ERROR", message);
}

/**
 * V3 — POST /api/mobile/v1/chat · Bearer (signed-in readers only — no anonymous trial in the app).
 * Body = the web chat body: `{ messages: {role:"user"|"assistant", content≤2000}[1..20],
 * stream?=true, conversationId?, industrySlug? | categorySlug? }`.
 *
 * Same code as `POST /modo-chat/api/chat`: `guardChatRequest` (per-account limit 20/h · 100/day ·
 * site cap — `checkRateLimit`, counted on saved turns) with the Bearer reader instead of the
 * cookie, then `answerChatTurn` (retrieval, partners-first, no web search, saved to ChatbotMessage).
 *
 * Responses:
 * - `stream:false`, or an early answer (partners / no sources): JSON in the envelope —
 *   `{ data: { conversationId, type:"message", text, partners? } }` or
 *   `{ data: { conversationId, type:"noSources", message, suggestedArticle?, partners? } }`.
 * - `stream:true` with grounded docs: NOT enveloped — `Content-Type: application/x-ndjson`, one JSON
 *   object per line: `{type:"ping"}` (every 10 s before the first token) · `{type:"delta",text}` ·
 *   final `{type:"done",conversationId,messageId?,sourceArticles?,partners?}` · or
 *   `{type:"error",error}`.
 */
export const POST = handle("chat", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", ACTION_MESSAGES.chatSignedInOnly);

  const guarded = await guardChatRequest(request, { userId: reader.id });
  if ("error" in guarded) return toEnvelope(guarded.error);

  const response = await answerChatTurn(guarded.ok);
  if (response.headers.get("content-type")?.includes("application/x-ndjson")) return response;
  return toEnvelope(response);
});
