import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeImages(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 15;
  let score = 0;
  const checks: SEOCheckItem[] = [];

  if (data.featuredImageId) {
    score += 10;
    checks.push({ passed: true, label: "صورة المقال الرئيسية", reason: "موجودة" });
  } else {
    checks.push({ passed: false, label: "صورة المقال الرئيسية", reason: "مفقودة — أضف صورة من تبويب المحتوى" });
  }

  if (data.featuredImageId && data.featuredImageAlt && data.featuredImageAlt.length > 0) {
    score += 5;
    checks.push({ passed: true, label: "النص البديل للصورة", reason: "موجود" });
  } else if (data.featuredImageId) {
    checks.push({ passed: false, label: "النص البديل للصورة", reason: "مفقود — أضفه من صفحة الميديا" });
  } else {
    checks.push({ passed: true, label: "النص البديل للصورة", reason: "لا يوجد صورة" });
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
