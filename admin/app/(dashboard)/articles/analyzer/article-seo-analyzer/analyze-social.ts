import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeSocial(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 5;
  let score = 0;
  const checks: SEOCheckItem[] = [];

  const hasOG = data.ogTitle || data.ogDescription || (data.featuredImageId && data.ogTitle);
  if (hasOG) {
    score += 3;
    checks.push({ passed: true, label: "بيانات المشاركة", reason: "موجودة" });
  } else {
    checks.push({ passed: false, label: "بيانات المشاركة", reason: "أضف عنوان ووصف في الإعدادات" });
  }

  if (data.twitterCard) {
    score += 2;
    checks.push({ passed: true, label: "بطاقة تويتر", reason: data.twitterCard });
  } else {
    checks.push({ passed: false, label: "بطاقة تويتر", reason: "أضفها في الإعدادات" });
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
