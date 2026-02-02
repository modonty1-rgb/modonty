import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeTechnical(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 10;
  let score = 0;
  const checks: SEOCheckItem[] = [];

  if (data.canonicalUrl && data.canonicalUrl.startsWith("https://")) {
    score += 5;
    checks.push({ passed: true, label: "Canonical URL uses HTTPS", reason: "OK" });
  } else if (data.canonicalUrl) {
    score += 3;
    checks.push({ passed: false, label: "Canonical URL uses HTTPS", reason: "Use https://" });
  } else {
    checks.push({ passed: false, label: "Canonical URL uses HTTPS", reason: "Missing" });
  }

  if (data.sitemapPriority !== null && data.sitemapChangeFreq) {
    score += 5;
    checks.push({ passed: true, label: "Sitemap priority & change freq", reason: "Both set" });
  } else if (data.sitemapPriority !== null || data.sitemapChangeFreq) {
    score += 2;
    checks.push({ passed: false, label: "Sitemap priority & change freq", reason: "Set both in Settings" });
  } else {
    checks.push({ passed: false, label: "Sitemap priority & change freq", reason: "Missing" });
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
