import "server-only";

import type { ChatMessage, DocumentForChat } from "./cohere-client";
import { buildClaudeBody, claudeFetch } from "./claude-client";

/** جوابٌ واحد بلا بثّ — نصّه فقط. */
export async function askClaude(messages: ChatMessage[], documents?: DocumentForChat[]): Promise<string> {
  const res = await claudeFetch(buildClaudeBody(messages, documents, false));
  const body = (await res.json()) as { content?: { type: string; text?: string }[] };
  return (body.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
}
