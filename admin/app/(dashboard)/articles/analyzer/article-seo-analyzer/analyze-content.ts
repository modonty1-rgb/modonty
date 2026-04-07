import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeContent(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 25;
  let score = 0;
  const checks: SEOCheckItem[] = [];

  if (data.wordCount >= 1500) {
    score += 18;
    checks.push({ passed: true, label: "عدد الكلمات ≥1500", reason: `${data.wordCount} كلمة — ممتاز` });
  } else if (data.wordCount >= 800) {
    score += 15;
    checks.push({ passed: true, label: "عدد الكلمات ≥800", reason: `${data.wordCount} كلمة — جيد` });
  } else if (data.wordCount >= 300) {
    score += 10;
    checks.push({ passed: true, label: "عدد الكلمات ≥300", reason: `${data.wordCount} كلمة — مقبول` });
  } else if (data.wordCount > 0) {
    score += 3;
    checks.push({ passed: false, label: "عدد الكلمات", reason: `${data.wordCount} كلمة — أضف محتوى أكثر (الحد الأدنى 300)` });
  } else {
    checks.push({ passed: false, label: "المحتوى", reason: "المقال فارغ — أضف محتوى" });
  }

  if (data.excerpt && data.excerpt.length >= 50) {
    score += 7;
    checks.push({ passed: true, label: "الملخص", reason: `${data.excerpt.length} حرف — جيد` });
  } else if (data.excerpt && data.excerpt.length > 0) {
    score += 4;
    checks.push({ passed: false, label: "الملخص", reason: `${data.excerpt.length} حرف — اكتب ملخص أطول (50 حرف على الأقل)` });
  } else {
    checks.push({ passed: false, label: "الملخص", reason: "مفقود — أضف ملخص للمقال" });
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
