import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeSocial(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 5;
  let score = 0;
  const checks: SEOCheckItem[] = [];

  const hasOG =
    data.ogTitle ||
    data.ogDescription ||
    (data.featuredImageId && data.ogTitle);
  if (hasOG) {
    score += 3;
    checks.push({ passed: true, label: "Open Graph metadata", reason: "Set" });
  } else {
    checks.push({ passed: false, label: "Open Graph metadata", reason: "Add OG title/description in Settings → Social" });
  }

  if (data.twitterCard) {
    score += 2;
    checks.push({ passed: true, label: "Twitter Card type", reason: data.twitterCard });
  } else {
    checks.push({ passed: false, label: "Twitter Card type", reason: "Add in Settings → Social" });
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
