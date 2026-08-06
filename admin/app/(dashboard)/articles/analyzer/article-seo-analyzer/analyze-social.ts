import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeSocial(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 5;
  const checks: SEOCheckItem[] = [];

  const hasOG = data.ogTitle || data.ogDescription || (data.featuredImageId && data.ogTitle);
  if (hasOG) {
    checks.push({ passed: true, label: "بيانات المشاركة", reason: "موجودة" });
  } else {
    checks.push({ passed: false, label: "بيانات المشاركة", reason: "أضف عنوان ووصف في الإعدادات" });
  }

  if (data.twitterCard) {
    checks.push({ passed: true, label: "بطاقة تويتر", reason: data.twitterCard });
  } else {
    checks.push({ passed: false, label: "بطاقة تويتر", reason: "أضفها في الإعدادات" });
  }

  const passed = checks.filter((c) => c.passed).length;
  const total = checks.length;

  return {
    maxScore,
    percentage: total > 0 ? Math.round((passed / total) * 100) : 0,
    passed,
    total,
    items: checks,
  };
}
