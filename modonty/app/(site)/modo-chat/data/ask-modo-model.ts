import "server-only";

import type { ChatMessage, DocumentForChat } from "./cohere-client";
import { isClaudeEnabled } from "./claude-client";

/**
 * جواب مودو بلا بثّ — Claude أوّلاً، وCohere احتياطٌ إن فشل (الزائر يأخذ جواباً في الحالتين).
 * المستهلكان: `answer-chat-turn.ts` ومسار سؤال المقال.
 */
export async function askModoModel(messages: ChatMessage[], documents?: DocumentForChat[]): Promise<string> {
  if (isClaudeEnabled()) {
    try {
      const { askClaude } = await import("./ask-claude");
      return await askClaude(messages, documents);
    } catch (e) {
      console.error("[modo-chat] Claude failed, falling back to Cohere", e);
    }
  }
  const { askCohere } = await import("./ask-cohere");
  const response = await askCohere(messages, documents);
  const msg = response as { text?: string; message?: { content?: Array<{ text?: string }> } };
  return msg.text ?? msg.message?.content?.[0]?.text ?? "";
}
