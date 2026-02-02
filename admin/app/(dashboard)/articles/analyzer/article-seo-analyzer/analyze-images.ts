import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeImages(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 15;
  let score = 0;
  const checks: SEOCheckItem[] = [];

  if (data.featuredImageId) {
    score += 10;
    checks.push({ passed: true, label: "Featured image", reason: "Set" });
  } else {
    checks.push({ passed: false, label: "Featured image", reason: "Missing" });
  }

  if (
    data.featuredImageId &&
    data.featuredImageAlt &&
    data.featuredImageAlt.length > 0
  ) {
    score += 5;
    checks.push({ passed: true, label: "Alt text for featured image", reason: "Provided" });
  } else if (data.featuredImageId) {
    checks.push({ passed: false, label: "Alt text for featured image", reason: "Missing (add in Media)" });
  } else {
    checks.push({ passed: true, label: "Alt text for featured image", reason: "N/A (no image)" });
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
