import "server-only";

import type { ChatMessage, DocumentForChat } from "./cohere-client";
import { buildClaudeBody, claudeFetch } from "./claude-client";

/**
 * يُخرج قطع النصّ من بثّ Claude (SSE). النصّ في `content_block_delta` بنوع `text_delta`، والخطأ أثناء
 * البثّ حدثٌ `error` — يُرمى ليمسكه `stream-answer-response.ts` كما كان يمسك خطأ Cohere.
 */
export async function* streamClaudeAnswer(messages: ChatMessage[], documents?: DocumentForChat[]) {
  const res = await claudeFetch(buildClaudeBody(messages, documents, true));
  if (!res.body) throw new Error("Claude: empty stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
    let cut: number;
    // الأحداث يفصلها سطرٌ فارغ؛ والقطعة الأخيرة غير المكتملة تنتظر الدفعة التالية
    while ((cut = buffer.indexOf("\n\n")) !== -1) {
      const event = buffer.slice(0, cut);
      buffer = buffer.slice(cut + 2);
      const data = event.split("\n").find((l) => l.startsWith("data:"))?.slice(5).trim();
      if (!data) continue;
      const parsed = JSON.parse(data) as {
        type: string;
        delta?: { type?: string; text?: string };
        error?: { type?: string; message?: string };
      };
      if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta" && parsed.delta.text) {
        yield parsed.delta.text;
      } else if (parsed.type === "error") {
        throw new Error(`Claude stream ${parsed.error?.type}: ${parsed.error?.message}`);
      } else if (parsed.type === "message_stop") {
        return;
      }
    }
  }
}
