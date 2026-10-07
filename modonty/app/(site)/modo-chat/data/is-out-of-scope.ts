import "server-only";

import { isGreetingOrShortPleasantry } from "../helpers/is-greeting-or-short-pleasantry";
import { cosineSimilarity } from "../helpers/cosine-similarity";
import { embedTexts } from "./embed-texts";

/** Relevance threshold: below this = out-of-scope (query not about this category). */
const OUT_OF_SCOPE_THRESHOLD = 0.52;

/**
 * Check if user message is out of scope (asking about a different topic/article).
 * Compares the query to several scope texts and takes the MAX similarity, so a related
 * sub-topic (Core Web Vitals inside Content SEO) still matches the category.
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
    embedTexts([userMessage], "search_query"),
    embedTexts(textsToCompare, "search_document"),
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
