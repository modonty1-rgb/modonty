import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeContent(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 25;
  let score = 0;
  const checks: SEOCheckItem[] = [];

  // Word count — realistic tiers based on Google best practices
  if (data.wordCount >= 1500) {
    score += 18;
    checks.push({ passed: true, label: "Word count ≥1500 (in-depth)", reason: `${data.wordCount} words — excellent for SEO` });
  } else if (data.wordCount >= 800) {
    score += 15;
    checks.push({ passed: true, label: "Word count ≥800", reason: `${data.wordCount} words — good length` });
  } else if (data.wordCount >= 300) {
    score += 10;
    checks.push({ passed: true, label: "Word count ≥300", reason: `${data.wordCount} words — acceptable` });
  } else if (data.wordCount > 0) {
    score += 3;
    checks.push({ passed: false, label: "Word count ≥300", reason: `${data.wordCount} words — too short (min 300)` });
  } else {
    checks.push({ passed: false, label: "Content", reason: "Empty article" });
  }

  // Excerpt — useful for social sharing and search snippets
  if (data.excerpt && data.excerpt.length >= 50) {
    score += 7;
    checks.push({ passed: true, label: "Excerpt (50+ chars)", reason: `${data.excerpt.length} chars` });
  } else if (data.excerpt && data.excerpt.length > 0) {
    score += 4;
    checks.push({ passed: false, label: "Excerpt (50+ chars)", reason: `${data.excerpt.length} chars — make it longer` });
  } else {
    checks.push({ passed: false, label: "Excerpt", reason: "Missing — add a summary" });
  }

  const passed = checks.filter((c) => c.passed).length;
  const total = checks.length;

  return {
    score: Math.round(score),
    maxScore,
    percentage: total > 0 ? Math.round((passed / total) * 100) : 0,
    passed,
    total,
    items: checks,
  };
}
