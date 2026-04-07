import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeTechnical(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 10;
  let score = 0;
  const checks: SEOCheckItem[] = [];

  if (data.canonicalUrl && data.canonicalUrl.startsWith("https://")) {
    score += 5;
    checks.push({ passed: true, label: "الرابط الأساسي HTTPS", reason: "آمن" });
  } else if (data.canonicalUrl) {
    score += 2;
    checks.push({ passed: false, label: "الرابط الأساسي HTTPS", reason: "استخدم https://" });
  } else {
    checks.push({ passed: false, label: "الرابط الأساسي", reason: "مفقود — مطلوب لمنع تكرار المحتوى" });
  }

  if (data.slug && data.slug.length > 0 && data.slug.length <= 75) {
    score += 5;
    checks.push({ passed: true, label: "الرابط المختصر", reason: `/${data.slug}` });
  } else if (data.slug && data.slug.length > 75) {
    score += 3;
    checks.push({ passed: false, label: "الرابط المختصر طويل", reason: `${data.slug.length} حرف — اجعله أقل من 75` });
  } else {
    checks.push({ passed: false, label: "الرابط المختصر", reason: "مفقود" });
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
