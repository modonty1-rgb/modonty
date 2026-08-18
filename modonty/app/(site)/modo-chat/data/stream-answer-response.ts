import "server-only";

import { NextResponse } from "next/server";

import { streamCohereAnswer } from "./stream-cohere-answer";

import type { ChatMessage, DocumentForChat } from "./cohere-client";

export interface StreamAnswerParams {
  chatMessages: ChatMessage[];
  /** The grounding documents. Absent means "answer from the prompt alone". */
  docs?: DocumentForChat[];
  conversationId: string;
  /** Extra fields to put on the final `done` frame — sources, partners, suggested article. */
  doneExtras?: Record<string, unknown>;
  /**
   * Called exactly once, whatever happens. `outcome` is `"stream"` for a completed answer and
   * `"error"` for one cut short — the visitor walking away counts as cut short, not as success.
   */
  /** Returns the saved row id, so the final frame can hand the browser something to rate. */
  onFinish: (fullText: string, outcome: "stream" | "error") => Promise<string | null> | void;
}

/**
 * The streaming half of an answer, shared by every route that answers a question.
 *
 * It exists because the same forty lines were written twice, and the copies drifted: the
 * cancellation guard below was added to the industry route on 2026-08-18 after a live
 * `ERR_INVALID_STATE`, and the article route never got it. One copy means one fix.
 *
 * Cancellation is a normal end, not an error. The visitor closing the tab cancels the response;
 * every later `enqueue` then throws, and the old catch block answered that by enqueueing AGAIN
 * on the same dead controller. Here we stop reading the model — which stops the billing — and
 * hand back whatever was produced.
 */
export function streamAnswerResponse({
  chatMessages,
  docs,
  conversationId,
  doneExtras,
  onFinish,
}: StreamAnswerParams): NextResponse {
  const encoder = new TextEncoder();
  let cancelled = false;

  const readable = new ReadableStream({
    async start(controller) {
      let fullText = "";
      /**
       * Silence before the FIRST token is the dangerous kind. The client gives up after 25s
       * without a byte, and the model can take longer than that to start on a cold cache —
       * measured live on 2026-08-18: the visitor saw «الرد تأخّر» while the answer was being
       * generated and paid for, and the identical question answered in 8s on retry.
       * A ping is a delivered byte: it resets the client's timer without claiming anything.
       */
      const ping = setInterval(() => {
        if (cancelled || fullText) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify({ type: "ping" }) + "\n"));
        } catch {
          // The stream ended between the check and the write — nothing to keep alive.
        }
      }, 10_000);

      try {
        for await (const chunk of streamCohereAnswer(chatMessages, docs?.length ? docs : undefined)) {
          if (cancelled) break;
          if (!fullText) clearInterval(ping);
          fullText += chunk;
          controller.enqueue(
            encoder.encode(JSON.stringify({ type: "delta", text: chunk }) + "\n")
          );
        }
        if (cancelled) {
          onFinish(fullText, "error");
          return;
        }
        // Saved BEFORE the final frame, not after: the row id is what lets the visitor rate the
        // answer, and it does not exist until the write returns. The answer is already fully on
        // screen by now, so the extra moment costs the reader nothing.
        const messageId = await onFinish(fullText, "stream");
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: "done",
              conversationId,
              ...(messageId && { messageId }),
              ...doneExtras,
            }) + "\n"
          )
        );
      } catch (err) {
        if (cancelled) return;
        const errMsg = err instanceof Error ? err.message : "حدث خطأ. حاول مرة أخرى.";
        console.error("[modo-chat] stream failed", err);
        onFinish(fullText, "error");
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: "error",
              error: process.env.NODE_ENV === "development" ? errMsg : "حدث خطأ. حاول مرة أخرى.",
            }) + "\n"
          )
        );
      } finally {
        clearInterval(ping);
        if (!cancelled) controller.close();
      }
    },
    cancel() {
      cancelled = true;
    },
  });

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
