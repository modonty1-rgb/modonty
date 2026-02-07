import { embed } from "@/lib/cohere";

/** Relevance threshold: below this = out-of-scope (query not about this article). */
const OUT_OF_SCOPE_THRESHOLD = 0.35;

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
 * Uses Cohere embed: compare query to article context (title + category + excerpt).
 * Greetings and short pleasantries are never out-of-scope.
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
  if (scopeContext.articleExcerpt) parts.push(scopeContext.articleExcerpt.slice(0, 300));
  const scopeText = parts.join(" ").trim();
  if (!scopeText) return false;

  const [queryEmb, docEmb] = await Promise.all([
    embed([userMessage], "search_query"),
    embed([scopeText], "search_document"),
  ]);

  if (!queryEmb?.[0] || !docEmb?.[0]) return false;

  const sim = cosineSimilarity(queryEmb[0], docEmb[0]);
  return sim < OUT_OF_SCOPE_THRESHOLD;
}
