import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeContent(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 25;
  let score = 0;
  const checks: SEOCheckItem[] = [];

  if (data.wordCount >= 800) {
    score += 15;
    checks.push({ passed: true, label: "Word count ≥800", reason: `${data.wordCount} words` });
  } else if (data.wordCount >= 300) {
    score += 8;
    checks.push({ passed: false, label: "Word count ≥800", reason: `${data.wordCount} words (target 800+)` });
  } else if (data.wordCount > 0) {
    score += 3;
    checks.push({ passed: false, label: "Word count ≥800", reason: `${data.wordCount} words (target 800+)` });
  } else {
    checks.push({ passed: false, label: "Word count ≥800", reason: "Empty" });
  }

  if (data.contentDepth) {
    score += 5;
    checks.push({ passed: true, label: "Content depth", reason: "Set" });
  } else {
    checks.push({ passed: false, label: "Content depth", reason: "Missing" });
  }

  if (data.excerpt && data.excerpt.length > 0) {
    score += 5;
    checks.push({ passed: true, label: "Excerpt", reason: "Provided" });
  } else {
    checks.push({ passed: false, label: "Excerpt", reason: "Missing" });
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
