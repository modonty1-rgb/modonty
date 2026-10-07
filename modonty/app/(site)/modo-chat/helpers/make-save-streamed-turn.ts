import { saveChatbotMessage } from "../data/save-chatbot-message";

type SaveParams = Parameters<typeof saveChatbotMessage>[0];

/**
 * The `onFinish` of a streamed answer: one saved row with the full text, whatever the outcome.
 * The same closure used to be written in both chat routes; the scope columns are the only
 * thing that differs between them, and they ride in `base`.
 */
export function makeSaveStreamedTurn(base: Omit<SaveParams, "assistantResponse" | "outcome" | "source">) {
  return (fullText: string, outcome: "stream" | "error") =>
    saveChatbotMessage({
      ...base,
      assistantResponse: fullText,
      outcome,
      source: "db",
    }).catch(() => null);
}
