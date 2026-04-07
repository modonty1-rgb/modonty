import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeStructuredData(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 20;
  let score = 0;
  const checks: SEOCheckItem[] = [];

  const hasSavedJsonLd = typeof data.jsonLdStructuredData === "string" && data.jsonLdStructuredData.length > 0;
  const hasCoreFieldsForJsonLd = !!data.title && !!data.canonicalUrl && !!data.seoDescription;

  if (hasSavedJsonLd || hasCoreFieldsForJsonLd) {
    score += 7;
    checks.push({
      passed: true,
      label: "بيانات JSON-LD",
      reason: hasSavedJsonLd ? "تم إنشاؤها" : "جاهزة — ستُنشأ عند الحفظ",
    });
  } else {
    checks.push({
      passed: false,
      label: "بيانات JSON-LD",
      reason: "أكمل العنوان والوصف والرابط الأساسي",
    });
  }

  let schemaScore = 0;
  const missing: string[] = [];
  if (data.title && data.title.length > 0) { schemaScore += 2; } else { missing.push("العنوان"); }
  if (data.authorId) { schemaScore += 2; } else { missing.push("الكاتب"); }
  if (data.datePublished) { schemaScore += 3; } else { missing.push("تاريخ النشر"); }
  if (data.canonicalUrl) { schemaScore += 3; } else { missing.push("الرابط الأساسي"); }
  if (data.seoDescription && data.seoDescription.length > 0) { schemaScore += 3; } else { missing.push("وصف البحث"); }

  score += schemaScore;
  const schemaOk = schemaScore >= 10;
  checks.push({
    passed: schemaOk,
    label: "الحقول الأساسية",
    reason: schemaOk ? "جميع الحقول المطلوبة موجودة" : `ينقص: ${missing.join("، ")}`,
  });

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
