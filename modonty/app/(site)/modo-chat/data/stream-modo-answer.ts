import "server-only";

import type { ChatMessage, DocumentForChat } from "./cohere-client";
import { isClaudeEnabled } from "./claude-client";
import { streamClaudeAnswer } from "./stream-claude-answer";
import { streamCohereAnswer } from "./stream-cohere-answer";

/**
 * بثّ جواب مودو — Claude أوّلاً. إن فشل **قبل أوّل كلمة** (مفتاح · رصيد · انقطاع) يُبثّ الجواب من
 * Cohere فلا يرى الزائر خطأً. إن فشل بعد أن بدأ النصّ يُرمى الخطأ: خلط جوابين في رسالة واحدة أسوأ.
 */
export async function* streamModoAnswer(messages: ChatMessage[], documents?: DocumentForChat[]) {
  if (isClaudeEnabled()) {
    let started = false;
    try {
      const t0 = Date.now();
      for await (const chunk of streamClaudeAnswer(messages, documents)) {
        if (!started && process.env.NODE_ENV === "development") console.debug("[modo-chat] claude first token", Date.now() - t0, "ms");
        started = true;
        yield chunk;
      }
      if (process.env.NODE_ENV === "development") console.debug("[modo-chat] claude done", Date.now() - t0, "ms");
      return;
    } catch (e) {
      if (started) throw e;
      console.error("[modo-chat] Claude stream failed before first token, falling back to Cohere", e);
    }
  }
  yield* streamCohereAnswer(messages, documents);
}
