import type { ArticleSEOCategory, SEOCheckItem } from "../article-seo-types";
import type { NormalizedInput } from "./normalize-input";

/**
 * يعدّ الروابط الداخلية في نصّ المقال.
 *
 * الداخلي = مسار نسبي (`/articles/…`) أو رابط مطلق على نطاقنا. تُستثنى الروابط
 * الخارجية والبريد والهاتف والمرساة داخل الصفحة (`#`) — تلك لا تربط صفحاتنا ببعضها.
 */
function countInternalLinks(content: string): number {
  const hrefs = [...content.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)].map((m) => m[1].trim());
  return hrefs.filter((h) => {
    if (!h || h.startsWith("#") || /^(mailto|tel|javascript):/i.test(h)) return false;
    if (h.startsWith("/")) return true;                       // مسار نسبي = داخلي
    return /^https?:\/\/(www\.)?modonty\.com/i.test(h);       // مطلق على نطاقنا
  }).length;
}

export function analyzeContent(data: NormalizedInput): ArticleSEOCategory {
  const maxScore = 25;
  const checks: SEOCheckItem[] = [];

  if (data.wordCount >= 1500) {
    checks.push({ passed: true, label: "عدد الكلمات ≥1500", reason: `${data.wordCount} كلمة — ممتاز` });
  } else if (data.wordCount >= 800) {
    checks.push({ passed: true, label: "عدد الكلمات ≥800", reason: `${data.wordCount} كلمة — جيد` });
  } else if (data.wordCount >= 300) {
    checks.push({ passed: true, label: "عدد الكلمات ≥300", reason: `${data.wordCount} كلمة — مقبول` });
  } else if (data.wordCount > 0) {
    checks.push({ passed: false, label: "عدد الكلمات", reason: `${data.wordCount} كلمة — أضف محتوى أكثر (الحد الأدنى 300)` });
  } else {
    checks.push({ passed: false, label: "المحتوى", reason: "المقال فارغ — أضف محتوى" });
  }

  if (data.excerpt && data.excerpt.length >= 50) {
    checks.push({ passed: true, label: "الملخص", reason: `${data.excerpt.length} حرف — جيد` });
  } else if (data.excerpt && data.excerpt.length > 0) {
    checks.push({ passed: false, label: "الملخص", reason: `${data.excerpt.length} حرف — اكتب ملخص أطول (50 حرف على الأقل)` });
  } else {
    checks.push({ passed: false, label: "الملخص", reason: "مفقود — أضف ملخص للمقال" });
  }

  // الروابط الداخلية داخل نصّ المقال. Google صريح في هذه:
  // «Every page you care about should have a link from at least one other page on your site»
  // و«Google uses links as a signal when determining the relevancy of pages».
  // (المقالات ذات الصلة أسفل المقال شيء آخر — تُختار من الأدمن وتُعرض للزائر أصلاً.)
  const internalLinks = countInternalLinks(data.content);
  if (internalLinks >= 2) {
    checks.push({ passed: true, label: "روابط داخلية في النصّ", reason: `${internalLinks} روابط — جيد` });
  } else if (internalLinks === 1) {
    checks.push({ passed: true, label: "روابط داخلية في النصّ", reason: "رابط واحد — أضف المزيد لربط أقوى" });
  } else {
    checks.push({
      passed: false,
      label: "روابط داخلية في النصّ",
      reason: "لا يوجد — اربط كلمات في المقال بمقالات أخرى من موقعك",
    });
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
