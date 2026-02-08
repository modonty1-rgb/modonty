import "server-only";
import { embed } from "@/lib/cohere";

/** Relevance threshold: below this = out-of-scope (query not about this category). */
const OUT_OF_SCOPE_THRESHOLD = 0.42;

/** Greetings/short pleasantries - never treat as out-of-scope. */
const GREETING_PATTERNS = [
  /^(hi|hello|hey|hiya|yo|sup|howdy)\s*!?$/i,
  /^(مرحبا?|أهلا|هلا|سلام|مرحبتين|السلام عليكم|أهلين)\s*!?$/i,
  /^(thanks?|thank you|شكرا|شكراً|مشكور|يعطيك العافية)\s*!?$/i,
  /^(ok|okay|تمام|حسنا)\s*!?$/i,
  /^(bye|goodbye|مع السلامة)\s*!?$/i,
];

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function isGreetingOrShortPleasantry(text: string): boolean {
  const t = text.trim();
  if (t.length < 3) return true;
  if (t.split(/\s+/).length <= 2 && t.length < 25) {
    return GREETING_PATTERNS.some((p) => p.test(t));
  }
  return false;
}

/**
 * Check if user message is out of scope (asking about a different topic/article).
 * Uses Cohere embed: compare query to scope. Per Cohere semantic-search docs,
 * we compare to multiple scope texts and use max similarity so related
 * sub-topics (e.g. Core Web Vitals in Content SEO) match the category.
 * Returns true if out-of-scope.
 */
export async function isOutOfScope(
  userMessage: string,
  scopeContext: {
    categoryName?: string;
    articleTitle?: string;
    articleExcerpt?: string;
  }
): Promise<boolean> {
  const t = userMessage.trim();
  if (!t) return false;

  if (isGreetingOrShortPleasantry(t)) return false;

  const parts: string[] = [];
  if (scopeContext.articleTitle) parts.push(scopeContext.articleTitle);
  if (scopeContext.categoryName) parts.push(scopeContext.categoryName);
  if (scopeContext.articleExcerpt) parts.push(scopeContext.articleExcerpt.slice(0, 500));
  const scopeText = parts.join(" ").trim();
  if (!scopeText) return false;

  const textsToCompare: string[] = [scopeText];
  if (scopeContext.categoryName && scopeText !== scopeContext.categoryName) {
    textsToCompare.push(scopeContext.categoryName);
  }

  const [queryEmb, docEmbs] = await Promise.all([
    embed([userMessage], "search_query"),
    embed(textsToCompare, "search_document"),
  ]);

  if (!queryEmb?.[0] || !docEmbs?.length) return false;

  const simScores = docEmbs.map((doc, i) => ({
    text: textsToCompare[i]?.slice(0, 80) ?? "",
    sim: cosineSimilarity(queryEmb[0], doc),
  }));
  const sim = Math.max(...simScores.map((s) => s.sim));
  const out = sim < OUT_OF_SCOPE_THRESHOLD;

  if (process.env.NODE_ENV === "development") {
    console.debug("[scope]", {
      query: userMessage.slice(0, 80),
      threshold: OUT_OF_SCOPE_THRESHOLD,
      simScores,
      maxSim: sim,
      outOfScope: out,
    });
  }

  return out;
}
