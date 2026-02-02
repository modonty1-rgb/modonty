import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeMetaTags(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 25;
  let score = 0;
  const checks: SEOCheckItem[] = [];

  const titleLength = data.seoTitle.length;
  if (titleLength >= 30 && titleLength <= 60) {
    score += 10;
    checks.push({ passed: true, label: "SEO title 30–60 chars", reason: `${titleLength} chars` });
  } else if (titleLength > 0 && titleLength < 30) {
    score += 5;
    checks.push({ passed: false, label: "SEO title 30–60 chars", reason: `${titleLength} chars (too short)` });
  } else if (titleLength > 60) {
    score += 5;
    checks.push({ passed: false, label: "SEO title 30–60 chars", reason: `${titleLength} chars (too long)` });
  } else {
    checks.push({ passed: false, label: "SEO title 30–60 chars", reason: "Missing" });
  }

  const descLength = data.seoDescription.length;
  if (descLength >= 120 && descLength <= 160) {
    score += 10;
    checks.push({ passed: true, label: "SEO description 120–160 chars", reason: `${descLength} chars` });
  } else if (descLength > 0 && descLength < 120) {
    score += 5;
    checks.push({ passed: false, label: "SEO description 120–160 chars", reason: `${descLength} chars (too short)` });
  } else if (descLength > 160) {
    score += 5;
    checks.push({ passed: false, label: "SEO description 120–160 chars", reason: `${descLength} chars (too long)` });
  } else {
    checks.push({ passed: false, label: "SEO description 120–160 chars", reason: "Missing" });
  }

  if (data.metaRobots && !data.metaRobots.includes("noindex")) {
    score += 5;
    checks.push({ passed: true, label: "Meta robots allow indexing", reason: data.metaRobots });
  } else {
    checks.push({ passed: false, label: "Meta robots allow indexing", reason: "noindex blocks search engines" });
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
