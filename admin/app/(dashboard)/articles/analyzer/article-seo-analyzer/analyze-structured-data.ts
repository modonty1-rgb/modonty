import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

export function analyzeStructuredData(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 20;
  const checks: SEOCheckItem[] = [];

  const hasSavedJsonLd = typeof data.jsonLdStructuredData === "string" && data.jsonLdStructuredData.length > 0;
  const hasCoreFieldsForJsonLd = !!data.title && !!data.canonicalUrl && !!data.seoDescription;

  // ينجح فقط لو البيانات مخزّنة فعلاً. الجاهزية وعدٌ لا حقيقة — كان
  // `hasSavedJsonLd || hasCoreFieldsForJsonLd` يعطي «✅ بيانات JSON-LD» والقاعدة فاضية.
  if (hasSavedJsonLd) {
    checks.push({ passed: true, label: "بيانات JSON-LD", reason: "مخزّنة" });
  } else {
    checks.push({
      passed: false,
      label: "بيانات JSON-LD",
      reason: hasCoreFieldsForJsonLd
        ? "غير مخزّنة بعد — تُنشأ عند الحفظ"
        : "أكمل العنوان والوصف والرابط الأساسي",
    });
  }
  const missing: string[] = [];
  if (!data.title) missing.push("العنوان");
  if (!data.authorId) missing.push("الكاتب");
  if (!data.datePublished) missing.push("تاريخ النشر");
  if (!data.canonicalUrl) missing.push("الرابط الأساسي");
  if (!data.seoDescription) missing.push("وصف البحث");
  // كل حقل هنا مطلوب في JSON-LD، فالنقص فشل — لا حدّ رقمي يمرّره.
  // (كان `schemaScore >= 10` والحدّ الأقصى 13، فمقال ينقصه تاريخ النشر كان يعطي 2/2 = 100%
  //  والقائمة `missing` تُبنى ثم تُرمى. بوّابة تقرّر النشر لا تُقرّب.)
  const schemaOk = missing.length === 0;
  checks.push({
    passed: schemaOk,
    label: "الحقول الأساسية",
    reason: schemaOk ? "جميع الحقول المطلوبة موجودة" : `ينقص: ${missing.join("، ")}`,
  });

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
