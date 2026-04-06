import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeTechnical(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 10;
  let score = 0;
  const checks: SEOCheckItem[] = [];

  // Canonical URL uses HTTPS — ranking signal
  if (data.canonicalUrl && data.canonicalUrl.startsWith("https://")) {
    score += 5;
    checks.push({ passed: true, label: "Canonical URL uses HTTPS", reason: "Secure" });
  } else if (data.canonicalUrl) {
    score += 2;
    checks.push({ passed: false, label: "Canonical URL uses HTTPS", reason: "Use https://" });
  } else {
    checks.push({ passed: false, label: "Canonical URL", reason: "Missing — needed to prevent duplicate content" });
  }

  // Slug is clean and SEO-friendly
  if (data.slug && data.slug.length > 0 && data.slug.length <= 75) {
    score += 5;
    checks.push({ passed: true, label: "URL slug is clean", reason: `/${data.slug}` });
  } else if (data.slug && data.slug.length > 75) {
    score += 3;
    checks.push({ passed: false, label: "URL slug too long", reason: `${data.slug.length} chars — keep under 75` });
  } else {
    checks.push({ passed: false, label: "URL slug", reason: "Missing" });
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
