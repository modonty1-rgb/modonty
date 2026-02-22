/**
 * Pre-Publish SEO Audit - Phase 10
 *
 * Comprehensive audit before publishing an article:
 * - Blocking issues (must fix before publish)
 * - Warnings (recommended fixes)
 * - Suggestions (optional improvements)
 */

import { Article, Author, Category, Media, ArticleFAQ } from "@prisma/client";

export interface AuditResult {
  canPublish: boolean;
  score: number; // 0-100
  blocking: AuditIssue[];
  warnings: AuditIssue[];
  suggestions: AuditIssue[];
  timestamp: string;
}

export interface AuditIssue {
  code: string;
  category: "content" | "seo" | "media" | "structured-data" | "eeat";
  message: string;
  fix?: string;
  field?: string;
}

// Article type for audit
interface ArticleForAudit extends Omit<Article, "jsonLdValidationReport"> {
  author: Author;
  category?: Category | null;
  featuredImage?: Media | null;
  faqs?: ArticleFAQ[];
  jsonLdValidationReport?: {
    adobe?: { errors?: unknown[]; warnings?: unknown[] };
    custom?: { errors?: string[]; warnings?: string[] };
  } | null;
}

export interface ClientForCompliance {
  forbiddenKeywords?: string[];
  forbiddenClaims?: string[];
}

function scanForbidden(
  text: string,
  list: string[]
): string[] {
  if (!text?.trim() || !list?.length) return [];
  const found: string[] = [];
  const lower = text.toLowerCase();
  for (const item of list) {
    if (!item?.trim()) continue;
    if (lower.includes(item.toLowerCase())) found.push(item);
  }
  return found;
}

/**
 * Run comprehensive pre-publish audit
 */
export function auditBeforePublish(
  article: ArticleForAudit,
  client?: ClientForCompliance | null
): AuditResult {
  const blocking: AuditIssue[] = [];
  const warnings: AuditIssue[] = [];
  const suggestions: AuditIssue[] = [];

  // === CONTENT CHECKS ===

  // Title is required
  if (!article.title || article.title.trim().length < 10) {
    blocking.push({
      code: "TITLE_MISSING",
      category: "content",
      message: "العنوان مفقود أو قصير جداً",
      fix: "أضف عنوان واضح (10+ حرف)",
      field: "title",
    });
  }

  // Content is required
  if (!article.content || article.content.trim().length < 200) {
    blocking.push({
      code: "CONTENT_TOO_SHORT",
      category: "content",
      message: "المحتوى قصير جداً أو مفقود",
      fix: "أضف محتوى أطول (200+ حرف)",
      field: "content",
    });
  }

  // Slug is required
  if (!article.slug) {
    blocking.push({
      code: "SLUG_MISSING",
      category: "seo",
      message: "الـ slug مفقود",
      fix: "أضف slug للمقال",
      field: "slug",
    });
  }

  // === SEO CHECKS ===

  // SEO Title
  const seoTitle = article.seoTitle || article.title;
  if (!seoTitle || seoTitle.length < 30) {
    warnings.push({
      code: "SEO_TITLE_SHORT",
      category: "seo",
      message: `عنوان SEO قصير (${seoTitle?.length || 0} حرف)`,
      fix: "اجعل العنوان 30-60 حرف للأفضلية في محركات البحث",
      field: "seoTitle",
    });
  } else if (seoTitle.length > 70) {
    warnings.push({
      code: "SEO_TITLE_LONG",
      category: "seo",
      message: `عنوان SEO طويل (${seoTitle.length} حرف)`,
      fix: "قلل العنوان إلى 60 حرف أو أقل",
      field: "seoTitle",
    });
  }

  // SEO Description
  const seoDesc = article.seoDescription || article.excerpt;
  if (!seoDesc || seoDesc.length < 120) {
    warnings.push({
      code: "SEO_DESC_SHORT",
      category: "seo",
      message: `وصف SEO قصير (${seoDesc?.length || 0} حرف)`,
      fix: "اجعل الوصف 120-160 حرف",
      field: "seoDescription",
    });
  } else if (seoDesc.length > 170) {
    suggestions.push({
      code: "SEO_DESC_LONG",
      category: "seo",
      message: `وصف SEO طويل (${seoDesc.length} حرف)`,
      fix: "قلل الوصف إلى 160 حرف",
      field: "seoDescription",
    });
  }

  // Word count check
  const wordCount = article.wordCount || 0;
  if (wordCount < 300) {
    warnings.push({
      code: "WORD_COUNT_LOW",
      category: "content",
      message: `عدد الكلمات قليل (${wordCount})`,
      fix: "أضف محتوى إضافي (الهدف: 800+ كلمة)",
      field: "content",
    });
  }

  // === MEDIA CHECKS ===

  // Hero image
  if (!article.featuredImageId) {
    blocking.push({
      code: "HERO_IMAGE_MISSING",
      category: "media",
      message: "الصورة الرئيسية مفقودة",
      fix: "أضف صورة رئيسية (1200×630 أو أكبر)",
      field: "featuredImageId",
    });
  } else if (article.featuredImage) {
    // Check alt text
    if (!article.featuredImage.altText) {
      warnings.push({
        code: "HERO_ALT_MISSING",
        category: "media",
        message: "الصورة الرئيسية بدون نص بديل",
        fix: "أضف نص بديل وصفي للصورة",
        field: "featuredImage.altText",
      });
    }

    // Check dimensions
    const width = article.featuredImage.width || 0;
    const height = article.featuredImage.height || 0;
    if (width < 1200 || height < 630) {
      suggestions.push({
        code: "HERO_SIZE_SMALL",
        category: "media",
        message: `حجم الصورة صغير (${width}×${height})`,
        fix: "استخدم صورة 1200×630 أو أكبر لأفضل عرض",
        field: "featuredImage",
      });
    }
  }

  // === E-E-A-T CHECKS ===

  // Author bio
  if (!article.author.bio || article.author.bio.length < 50) {
    warnings.push({
      code: "AUTHOR_BIO_MISSING",
      category: "eeat",
      message: "سيرة الكاتب مفقودة أو قصيرة",
      fix: "أضف سيرة ذاتية للكاتب (50+ حرف)",
    });
  }

  // Author image
  if (!article.author.image) {
    suggestions.push({
      code: "AUTHOR_IMAGE_MISSING",
      category: "eeat",
      message: "صورة الكاتب مفقودة",
      fix: "أضف صورة شخصية للكاتب",
    });
  }

  // Citations
  const citations = article.citations || [];
  if (citations.length === 0) {
    suggestions.push({
      code: "NO_CITATIONS",
      category: "eeat",
      message: "لا توجد مصادر أو اقتباسات",
      fix: "أضف روابط لمصادر موثوقة",
      field: "citations",
    });
  }

  // === STRUCTURED DATA CHECKS ===

  // JSON-LD validation
  if (!article.jsonLdStructuredData) {
    warnings.push({
      code: "JSONLD_MISSING",
      category: "structured-data",
      message: "JSON-LD غير موجود",
      fix: "قم بتوليد JSON-LD للمقال",
    });
  } else if (article.jsonLdValidationReport) {
    const report = article.jsonLdValidationReport;

    // Check Adobe validation errors
    const adobeErrors = report.adobe?.errors || [];
    if (Array.isArray(adobeErrors) && adobeErrors.length > 0) {
      blocking.push({
        code: "JSONLD_INVALID",
        category: "structured-data",
        message: `JSON-LD غير صالح (${adobeErrors.length} خطأ)`,
        fix: "أصلح أخطاء البيانات المهيكلة",
      });
    }

    // Check custom validation errors
    const customErrors = report.custom?.errors || [];
    if (customErrors.length > 0) {
      for (const err of customErrors) {
        warnings.push({
          code: "JSONLD_BUSINESS_ERROR",
          category: "structured-data",
          message: err,
          fix: "أصلح المشكلة المذكورة",
        });
      }
    }
  }

  // FAQs
  const faqCount = article.faqs?.length || 0;
  if (faqCount === 0) {
    suggestions.push({
      code: "NO_FAQS",
      category: "structured-data",
      message: "لا توجد أسئلة شائعة",
      fix: "أضف 3-5 أسئلة شائعة للحصول على FAQ rich results",
    });
  }

  // Category
  if (!article.categoryId) {
    suggestions.push({
      code: "NO_CATEGORY",
      category: "seo",
      message: "المقال بدون تصنيف",
      fix: "حدد تصنيفاً للمقال",
      field: "categoryId",
    });
  }

  // === COMPLIANCE CHECKS (client forbidden keywords/claims) ===
  if (client?.forbiddenKeywords?.length) {
    const texts = [
      article.title ?? "",
      article.content ?? "",
      article.seoTitle ?? "",
      article.seoDescription ?? "",
      article.excerpt ?? "",
    ].join(" ");
    const found = scanForbidden(texts, client.forbiddenKeywords);
    for (const kw of found) {
      blocking.push({
        code: "FORBIDDEN_KEYWORD",
        category: "content",
        message: `المحتوى يحتوي على كلمة ممنوعة: "${kw}"`,
        fix: "أزل الكلمة الممنوعة أو استبدلها",
      });
    }
  }

  if (client?.forbiddenClaims?.length) {
    const texts = [
      article.title ?? "",
      article.content ?? "",
      article.seoTitle ?? "",
      article.seoDescription ?? "",
      article.excerpt ?? "",
    ].join(" ");
    const found = scanForbidden(texts, client.forbiddenClaims);
    for (const claim of found) {
      blocking.push({
        code: "FORBIDDEN_CLAIM",
        category: "content",
        message: `المحتوى يحتوي على ادعاء ممنوع: "${claim}"`,
        fix: "أزل الادعاء الممنوع أو استبدله",
      });
    }
  }

  // === CALCULATE SCORE ===
  let score = 100;
  score -= blocking.length * 20;
  score -= warnings.length * 5;
  score -= suggestions.length * 2;
  score = Math.max(0, Math.min(100, score));

  return {
    canPublish: blocking.length === 0,
    score,
    blocking,
    warnings,
    suggestions,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Compliance-only check for forbidden keywords/claims.
 * Use before publishing when you have form data but not a full article.
 */
export function checkCompliance(
  data: {
    title?: string | null;
    content?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    excerpt?: string | null;
  },
  client: ClientForCompliance | null | undefined
): { blocked: boolean; issues: AuditIssue[] } {
  const issues: AuditIssue[] = [];
  if (!client) return { blocked: false, issues };

  const texts = [
    data.title ?? "",
    data.content ?? "",
    data.seoTitle ?? "",
    data.seoDescription ?? "",
    data.excerpt ?? "",
  ].join(" ");

  if (client.forbiddenKeywords?.length) {
    const found = scanForbidden(texts, client.forbiddenKeywords);
    for (const kw of found) {
      issues.push({
        code: "FORBIDDEN_KEYWORD",
        category: "content",
        message: `المحتوى يحتوي على كلمة ممنوعة: "${kw}"`,
        fix: "أزل الكلمة الممنوعة أو استبدلها",
      });
    }
  }

  if (client.forbiddenClaims?.length) {
    const found = scanForbidden(texts, client.forbiddenClaims);
    for (const claim of found) {
      issues.push({
        code: "FORBIDDEN_CLAIM",
        category: "content",
        message: `المحتوى يحتوي على ادعاء ممنوع: "${claim}"`,
        fix: "أزل الادعاء الممنوع أو استبدله",
      });
    }
  }

  return { blocked: issues.length > 0, issues };
}

/**
 * Get audit summary as text
 */
export function getAuditSummary(result: AuditResult): string {
  const parts: string[] = [];

  if (result.canPublish) {
    parts.push(`✅ جاهز للنشر (${result.score}/100)`);
  } else {
    parts.push(`❌ غير جاهز للنشر (${result.blocking.length} مشكلة حرجة)`);
  }

  if (result.warnings.length > 0) {
    parts.push(`⚠️ ${result.warnings.length} تحذير`);
  }

  if (result.suggestions.length > 0) {
    parts.push(`💡 ${result.suggestions.length} اقتراح`);
  }

  return parts.join(" | ");
}

/**
 * Get issues by category
 */
export function groupIssuesByCategory(result: AuditResult): Record<string, AuditIssue[]> {
  const all = [...result.blocking, ...result.warnings, ...result.suggestions];
  const grouped: Record<string, AuditIssue[]> = {};

  for (const issue of all) {
    if (!grouped[issue.category]) {
      grouped[issue.category] = [];
    }
    grouped[issue.category].push(issue);
  }

  return grouped;
}
