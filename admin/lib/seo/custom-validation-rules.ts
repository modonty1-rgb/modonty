/**
 * Custom Validation Rules Engine - Phase 11
 *
 * Business-specific validation rules beyond schema.org:
 * - Arabic content requirements
 * - Publisher logo size requirements
 * - Internal linking recommendations
 * - Content quality thresholds
 */

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: "content" | "media" | "seo" | "eeat" | "technical";
  severity: "error" | "warning" | "info";
  validate: (data: RuleContext) => ValidationRuleResult;
}

export interface RuleContext {
  article: {
    title: string;
    content: string;
    excerpt?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    wordCount?: number | null;
    inLanguage?: string;
    citations?: string[];
  };
  author?: {
    name: string;
    bio?: string | null;
    image?: string | null;
    expertiseAreas?: string[];
    credentials?: string[];
  } | null;
  publisher?: {
    name: string;
    logoUrl?: string | null;
    logoWidth?: number | null;
    logoHeight?: number | null;
  } | null;
  featuredImage?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  jsonLd?: object | null;
}

export interface ValidationRuleResult {
  passed: boolean;
  message?: string;
  details?: string;
}

export interface CustomValidationReport {
  passed: number;
  failed: number;
  warnings: number;
  info: number;
  results: Array<{
    rule: ValidationRule;
    result: ValidationRuleResult;
  }>;
}

// === CUSTOM RULES ===

const ARABIC_CONTENT_RULE: ValidationRule = {
  id: "arabic-content",
  name: "Arabic Content Check",
  description: "التأكد من أن المحتوى باللغة العربية",
  category: "content",
  severity: "warning",
  validate: (ctx) => {
    if (ctx.article.inLanguage !== "ar") {
      return { passed: true }; // Skip for non-Arabic
    }

    // Check if content contains Arabic characters
    const arabicRegex = /[\u0600-\u06FF]/;
    const hasArabic = arabicRegex.test(ctx.article.content);

    if (!hasArabic) {
      return {
        passed: false,
        message: "المحتوى لا يحتوي على نص عربي",
        details: "تأكد من أن المحتوى مكتوب بالعربية",
      };
    }

    // Check Arabic ratio (should be > 70%)
    const arabicChars = (ctx.article.content.match(/[\u0600-\u06FF]/g) || []).length;
    const totalChars = ctx.article.content.replace(/\s/g, "").length;
    const arabicRatio = totalChars > 0 ? arabicChars / totalChars : 0;

    if (arabicRatio < 0.5) {
      return {
        passed: false,
        message: `نسبة المحتوى العربي منخفضة (${Math.round(arabicRatio * 100)}%)`,
        details: "يُفضل أن تكون نسبة المحتوى العربي أعلى من 50%",
      };
    }

    return { passed: true };
  },
};

const PUBLISHER_LOGO_SIZE_RULE: ValidationRule = {
  id: "publisher-logo-size",
  name: "Publisher Logo Size",
  description: "التحقق من حجم شعار الناشر (Google requirement)",
  category: "media",
  severity: "error",
  validate: (ctx) => {
    if (!ctx.publisher?.logoUrl) {
      return {
        passed: false,
        message: "شعار الناشر مفقود",
        details: "شعار الناشر مطلوب لـ Article rich results",
      };
    }

    const width = ctx.publisher.logoWidth || 0;
    const height = ctx.publisher.logoHeight || 0;

    // Google recommends: 600×60 minimum
    if (width < 112 || height < 112) {
      return {
        passed: false,
        message: `حجم الشعار صغير (${width}×${height})`,
        details: "الحد الأدنى المطلوب من Google: 112×112 pixels",
      };
    }

    // Maximum: 600px height
    if (height > 600) {
      return {
        passed: false,
        message: `ارتفاع الشعار كبير جداً (${height}px)`,
        details: "الحد الأقصى للارتفاع: 600 pixels",
      };
    }

    return { passed: true };
  },
};

const INTERNAL_LINKING_RULE: ValidationRule = {
  id: "internal-linking",
  name: "Internal Linking",
  description: "التحقق من وجود روابط داخلية",
  category: "seo",
  severity: "info",
  validate: (ctx) => {
    // Count internal links
    const internalLinkRegex = /<a\s+[^>]*href=["'](\/|https?:\/\/modonty\.com)[^"']*["'][^>]*>/gi;
    const internalLinks = ctx.article.content.match(internalLinkRegex) || [];

    if (internalLinks.length === 0) {
      return {
        passed: false,
        message: "لا توجد روابط داخلية",
        details: "أضف 2-3 روابط لمقالات ذات صلة لتحسين SEO",
      };
    }

    if (internalLinks.length < 2) {
      return {
        passed: true,
        message: `عدد الروابط الداخلية: ${internalLinks.length}`,
        details: "يُفضل وجود 2-5 روابط داخلية",
      };
    }

    return { passed: true };
  },
};

const WORD_COUNT_THRESHOLD_RULE: ValidationRule = {
  id: "word-count-threshold",
  name: "Word Count Threshold",
  description: "التحقق من الحد الأدنى لعدد الكلمات",
  category: "content",
  severity: "warning",
  validate: (ctx) => {
    const wordCount = ctx.article.wordCount || 0;

    if (wordCount < 300) {
      return {
        passed: false,
        message: `عدد الكلمات قليل جداً (${wordCount})`,
        details: "الحد الأدنى المقبول: 300 كلمة. الهدف: 800+ كلمة",
      };
    }

    if (wordCount < 800) {
      return {
        passed: true,
        message: `عدد الكلمات: ${wordCount}`,
        details: "للمنافسة الأفضل، يُفضل 1000+ كلمة",
      };
    }

    return { passed: true };
  },
};

const HERO_IMAGE_REQUIREMENTS_RULE: ValidationRule = {
  id: "hero-image-requirements",
  name: "Hero Image Requirements",
  description: "متطلبات الصورة الرئيسية",
  category: "media",
  severity: "error",
  validate: (ctx) => {
    if (!ctx.featuredImage) {
      return {
        passed: false,
        message: "الصورة الرئيسية مفقودة",
        details: "مطلوبة لـ Article rich results",
      };
    }

    if (!ctx.featuredImage.altText) {
      return {
        passed: false,
        message: "النص البديل للصورة مفقود",
        details: "أضف نص بديل وصفي للصورة (accessibility + SEO)",
      };
    }

    const width = ctx.featuredImage.width || 0;
    const height = ctx.featuredImage.height || 0;

    // Google minimum: 1200 pixels wide
    if (width < 1200) {
      return {
        passed: false,
        message: `عرض الصورة صغير (${width}px)`,
        details: "الحد الأدنى: 1200 pixels. الأفضل: 1200×630 (OG ratio)",
      };
    }

    return { passed: true };
  },
};

const AUTHOR_EEAT_RULE: ValidationRule = {
  id: "author-eeat",
  name: "Author E-E-A-T Signals",
  description: "إشارات الخبرة والمصداقية للكاتب",
  category: "eeat",
  severity: "warning",
  validate: (ctx) => {
    if (!ctx.author) {
      return {
        passed: false,
        message: "معلومات الكاتب مفقودة",
      };
    }

    const issues: string[] = [];

    if (!ctx.author.bio || ctx.author.bio.length < 50) {
      issues.push("سيرة ذاتية قصيرة أو مفقودة");
    }

    if (!ctx.author.image) {
      issues.push("صورة شخصية مفقودة");
    }

    if (!ctx.author.expertiseAreas || ctx.author.expertiseAreas.length === 0) {
      issues.push("مجالات الخبرة غير محددة");
    }

    if (issues.length > 0) {
      return {
        passed: false,
        message: `${issues.length} مشكلة في بيانات الكاتب`,
        details: issues.join("، "),
      };
    }

    return { passed: true };
  },
};

const CITATIONS_RULE: ValidationRule = {
  id: "citations",
  name: "Citations & Sources",
  description: "التحقق من وجود مصادر موثوقة",
  category: "eeat",
  severity: "info",
  validate: (ctx) => {
    const citations = ctx.article.citations || [];

    if (citations.length === 0) {
      // Check for external links as alternative
      const externalLinkRegex = /<a\s+[^>]*href=["']https?:\/\/(?!modonty\.com)[^"']*["'][^>]*>/gi;
      const externalLinks = ctx.article.content.match(externalLinkRegex) || [];

      if (externalLinks.length === 0) {
        return {
          passed: false,
          message: "لا توجد مصادر أو روابط خارجية",
          details: "أضف مصادر موثوقة لتعزيز المصداقية",
        };
      }
    }

    return { passed: true };
  },
};

const JSON_LD_GRAPH_STRUCTURE_RULE: ValidationRule = {
  id: "jsonld-graph-structure",
  name: "JSON-LD Graph Structure",
  description: "التحقق من بنية @graph",
  category: "technical",
  severity: "error",
  validate: (ctx) => {
    if (!ctx.jsonLd) {
      return {
        passed: false,
        message: "JSON-LD غير موجود",
      };
    }

    const jsonLd = ctx.jsonLd as { "@context"?: string; "@graph"?: unknown[] };

    if (jsonLd["@context"] !== "https://schema.org") {
      return {
        passed: false,
        message: "@context غير صحيح",
        details: 'يجب أن يكون "https://schema.org"',
      };
    }

    if (!jsonLd["@graph"] || !Array.isArray(jsonLd["@graph"])) {
      return {
        passed: false,
        message: "@graph مفقود أو غير صالح",
        details: "يجب أن يكون @graph مصفوفة من الكيانات",
      };
    }

    // Check for required node types
    const types = (jsonLd["@graph"] as Array<Record<string, unknown>>).map(
      (n) => n["@type"] as string | undefined
    );
    const requiredTypes = ["Article", "Person", "Organization"];
    const missingTypes = requiredTypes.filter((t) => !types.includes(t));

    if (missingTypes.length > 0) {
      return {
        passed: false,
        message: `أنواع مفقودة: ${missingTypes.join(", ")}`,
        details: "يجب أن يحتوي @graph على Article, Person, Organization",
      };
    }

    return { passed: true };
  },
};

// === RULES REGISTRY ===

export const CUSTOM_RULES: ValidationRule[] = [
  ARABIC_CONTENT_RULE,
  PUBLISHER_LOGO_SIZE_RULE,
  INTERNAL_LINKING_RULE,
  WORD_COUNT_THRESHOLD_RULE,
  HERO_IMAGE_REQUIREMENTS_RULE,
  AUTHOR_EEAT_RULE,
  CITATIONS_RULE,
  JSON_LD_GRAPH_STRUCTURE_RULE,
];

/**
 * Run all custom validation rules
 */
export function runCustomValidation(context: RuleContext): CustomValidationReport {
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  let info = 0;

  const results: CustomValidationReport["results"] = [];

  for (const rule of CUSTOM_RULES) {
    const result = rule.validate(context);

    results.push({ rule, result });

    if (result.passed) {
      passed++;
    } else {
      switch (rule.severity) {
        case "error":
          failed++;
          break;
        case "warning":
          warnings++;
          break;
        case "info":
          info++;
          break;
      }
    }
  }

  return { passed, failed, warnings, info, results };
}

/**
 * Get only failed rules by severity
 */
export function getFailedRules(
  report: CustomValidationReport,
  severity?: "error" | "warning" | "info"
): CustomValidationReport["results"] {
  return report.results.filter((r) => {
    if (r.result.passed) return false;
    if (severity && r.rule.severity !== severity) return false;
    return true;
  });
}

/**
 * Check if custom validation passes (no errors)
 */
export function customValidationPasses(report: CustomValidationReport): boolean {
  return report.failed === 0;
}
