import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeMetaTags(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 25;
  let score = 0;
  const checks: SEOCheckItem[] = [];

  const titleLength = data.seoTitle.length;
  if (titleLength >= 30 && titleLength <= 60) {
    score += 10;
    checks.push({ passed: true, label: "عنوان البحث 30–60 حرف", reason: `${titleLength} حرف — مثالي` });
  } else if (titleLength > 0 && titleLength < 30) {
    score += 5;
    checks.push({ passed: false, label: "عنوان البحث 30–60 حرف", reason: `${titleLength} حرف — قصير جداً` });
  } else if (titleLength > 60) {
    score += 5;
    checks.push({ passed: false, label: "عنوان البحث 30–60 حرف", reason: `${titleLength} حرف — طويل جداً` });
  } else {
    checks.push({ passed: false, label: "عنوان البحث", reason: "مفقود — أضف عنوان في تبويب SEO" });
  }

  const descLength = data.seoDescription.length;
  if (descLength >= 120 && descLength <= 160) {
    score += 10;
    checks.push({ passed: true, label: "وصف البحث 120–160 حرف", reason: `${descLength} حرف — مثالي` });
  } else if (descLength > 0 && descLength < 120) {
    score += 5;
    checks.push({ passed: false, label: "وصف البحث 120–160 حرف", reason: `${descLength} حرف — قصير جداً` });
  } else if (descLength > 160) {
    score += 5;
    checks.push({ passed: false, label: "وصف البحث 120–160 حرف", reason: `${descLength} حرف — طويل جداً` });
  } else {
    checks.push({ passed: false, label: "وصف البحث", reason: "مفقود — أضف وصف في تبويب SEO" });
  }

  if (data.metaRobots && !data.metaRobots.includes("noindex")) {
    score += 5;
    checks.push({ passed: true, label: "الفهرسة مفعّلة", reason: data.metaRobots });
  } else {
    checks.push({ passed: false, label: "الفهرسة", reason: "محظورة — noindex يمنع ظهور المقال في البحث" });
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
