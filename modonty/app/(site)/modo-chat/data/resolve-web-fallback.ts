import "server-only";

import { searchSerper } from "./search-serper";
import { hasTrustedContent } from "../helpers/has-trusted-content";

import type { DocumentForChat } from "./cohere-client";

export type WebSource = { title: string; link: string };

export type WebFallback =
  | { ok: true; docs: DocumentForChat[]; sources: WebSource[] }
  | { ok: false; message: string };

/**
 * The web search we fall back to when neither our articles nor our partners can answer.
 *
 * A failed search must never look like a successful answer. The article route used to swallow
 * the error and continue with `docs = []`, which selected the documents-only prompt with no
 * documents — so the model produced its canned refusal while the row was saved as a successful
 * answer from our own content. Failure returns `ok: false` here, and the caller says so.
 */
export async function resolveWebFallback(query: string): Promise<WebFallback> {
  try {
    const results = await searchSerper(query, 8);

    // Snippets too thin to ground an answer are worse than none — they read authoritative.
    if (!hasTrustedContent(results)) {
      return { ok: false, message: "لم أعثر على مصادر موثوقة كافية للإجابة على هذا السؤال." };
    }

    return {
      ok: true,
      sources: results.map((r) => ({ title: r.title, link: r.link })),
      docs: results.map((r, i) => ({
        id: `doc-web-${i}`,
        text: `${r.title}\n${r.snippet}\n${r.link}`,
      })),
    };
  } catch (err) {
    console.error("[modo-chat] web search failed", err);
    return { ok: false, message: "ما قدرت أوصل لمصادر إضافية الحين. جرّب بعد شوي، أو اسأل عن موضوع ثاني." };
  }
}
