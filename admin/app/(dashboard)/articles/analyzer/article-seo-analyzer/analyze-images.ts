import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeImages(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 15;
  const checks: SEOCheckItem[] = [];

  if (data.featuredImageId) {
    checks.push({ passed: true, label: "صورة المقال الرئيسية", reason: "موجودة" });
  } else {
    checks.push({ passed: false, label: "صورة المقال الرئيسية", reason: "مفقودة — أضف صورة من تبويب المحتوى" });
  }

  // فحص النصّ البديل يُطرح فقط حين توجد صورة. غياب الصورة لا يُنتج نجاحاً —
  // كان يُضاف `passed: true` بحجّة «لا يوجد صورة»، فيتساوى المقال بلا صورة (50%)
  // مع المقال الذي له صورة بلا نصّ بديل (50%). الآن: بلا صورة = 0/1.
  if (data.featuredImageId) {
    if (data.featuredImageAlt && data.featuredImageAlt.length > 0) {
      checks.push({ passed: true, label: "النص البديل للصورة", reason: "موجود" });
    } else {
      checks.push({ passed: false, label: "النص البديل للصورة", reason: "مفقود — أضفه من صفحة الميديا" });
    }
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
