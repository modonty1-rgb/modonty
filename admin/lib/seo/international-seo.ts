/**
 * International SEO - Phase 13
 *
 * Handles multilingual and international SEO:
 * - Hreflang tag generation
 * - Multilingual JSON-LD
 * - Arabic/RTL optimization
 */

export interface HreflangLink {
  hreflang: string;
  href: string;
}

export interface MultilingualArticle {
  language: string;
  url: string;
  title?: string;
}

export interface InternationalSEOData {
  hreflangLinks: HreflangLink[];
  defaultLanguage: string;
  availableLanguages: string[];
  isRTL: boolean;
}

// Supported languages
export const SUPPORTED_LANGUAGES = {
  ar: { name: "العربية", dir: "rtl", locale: "ar_SA" },
  en: { name: "English", dir: "ltr", locale: "en_US" },
  fr: { name: "Français", dir: "ltr", locale: "fr_FR" },
} as const;

/**
 * Generate hreflang links for an article
 */
export function generateHreflangLinks(
  currentUrl: string,
  currentLanguage: string,
  alternateVersions: MultilingualArticle[],
  includeXDefault: boolean = true
): HreflangLink[] {
  const links: HreflangLink[] = [];

  // Add current language
  links.push({
    hreflang: currentLanguage,
    href: currentUrl,
  });

  // Add alternate versions
  for (const version of alternateVersions) {
    if (version.language !== currentLanguage) {
      links.push({
        hreflang: version.language,
        href: version.url,
      });
    }
  }

  // Add x-default (usually points to main/default language)
  if (includeXDefault) {
    const defaultVersion = alternateVersions.find((v) => v.language === "ar") ||
      alternateVersions[0] || { url: currentUrl };
    links.push({
      hreflang: "x-default",
      href: defaultVersion.url,
    });
  }

  return links;
}

/**
 * Generate hreflang HTML tags
 */
export function generateHreflangHTML(links: HreflangLink[]): string {
  return links
    .map(
      (link) =>
        `<link rel="alternate" hreflang="${link.hreflang}" href="${link.href}" />`
    )
    .join("\n");
}

/**
 * Generate multilingual JSON-LD
 */
export function generateMultilingualJsonLd(
  baseJsonLd: object,
  alternateVersions: MultilingualArticle[]
): object {
  const jsonLd = JSON.parse(JSON.stringify(baseJsonLd));
  const graph = jsonLd["@graph"];

  if (!Array.isArray(graph)) return jsonLd;

  // Find Article node
  const articleNode = graph.find(
    (n: { "@type"?: string }) => n["@type"] === "Article"
  );

  if (!articleNode) return jsonLd;

  // Add workTranslation for alternate versions
  if (alternateVersions.length > 0) {
    articleNode.workTranslation = alternateVersions.map((version) => ({
      "@type": "Article",
      inLanguage: version.language,
      url: version.url,
      ...(version.title && { headline: version.title }),
    }));
  }

  return jsonLd;
}

/**
 * Check if language is RTL
 */
export function isRTLLanguage(language: string): boolean {
  const rtlLanguages = ["ar", "he", "fa", "ur"];
  return rtlLanguages.includes(language.toLowerCase());
}

/**
 * Optimize content for Arabic/RTL
 */
export function optimizeForArabicContent(content: {
  title: string;
  description?: string;
  content: string;
}): {
  isArabic: boolean;
  arabicRatio: number;
  recommendations: string[];
  optimizations: {
    shouldAddDirRTL: boolean;
    shouldUseTashkeel: boolean;
    hasProperPunctuation: boolean;
  };
} {
  const recommendations: string[] = [];

  // Check Arabic character ratio
  const text = content.title + " " + (content.description || "") + " " + content.content;
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const totalChars = text.replace(/\s/g, "").length;
  const arabicRatio = totalChars > 0 ? arabicChars / totalChars : 0;

  const isArabic = arabicRatio > 0.5;

  // Check for proper Arabic punctuation
  const hasArabicComma = text.includes("،");
  const hasArabicQuestion = text.includes("؟");
  const hasProperPunctuation = hasArabicComma || hasArabicQuestion;

  if (isArabic && !hasProperPunctuation) {
    recommendations.push("استخدم علامات الترقيم العربية (، و ؟) بدلاً من الإنجليزية");
  }

  // Check for Tashkeel (diacritics)
  const hasTashkeel = /[\u064B-\u0652]/.test(text);
  const shouldUseTashkeel = !hasTashkeel && arabicRatio > 0.7;

  if (shouldUseTashkeel) {
    recommendations.push("إضافة التشكيل قد يحسن من فهم المحتوى");
  }

  // Check for mixed direction issues
  const hasEnglishWords = /[a-zA-Z]{3,}/.test(text);
  if (isArabic && hasEnglishWords) {
    recommendations.push("تأكد من ترتيب الكلمات الإنجليزية داخل النص العربي");
  }

  return {
    isArabic,
    arabicRatio: Math.round(arabicRatio * 100) / 100,
    recommendations,
    optimizations: {
      shouldAddDirRTL: isArabic,
      shouldUseTashkeel,
      hasProperPunctuation,
    },
  };
}

/**
 * Validate Arabic JSON-LD
 */
export function validateArabicJsonLd(jsonLd: object): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const graph = (jsonLd as { "@graph"?: unknown[] })["@graph"];

  if (!Array.isArray(graph)) {
    issues.push("JSON-LD لا يحتوي على @graph");
    return { valid: false, issues };
  }

  const articleNode = (graph as Array<Record<string, unknown>>).find(
    (n) => n["@type"] === "Article"
  );

  if (!articleNode) {
    issues.push("لا يوجد Article node");
    return { valid: false, issues };
  }

  // Check inLanguage
  if (articleNode.inLanguage !== "ar") {
    issues.push('inLanguage يجب أن يكون "ar" للمحتوى العربي');
  }

  // Check headline for Arabic
  const headline = articleNode.headline as string | undefined;
  if (headline) {
    const hasArabic = /[\u0600-\u06FF]/.test(headline);
    if (!hasArabic) {
      issues.push("العنوان (headline) لا يحتوي على نص عربي");
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Get locale for Open Graph from language
 */
export function getOGLocale(language: string): string {
  const localeMap: Record<string, string> = {
    ar: "ar_SA",
    en: "en_US",
    fr: "fr_FR",
    es: "es_ES",
    de: "de_DE",
  };
  return localeMap[language] || `${language}_${language.toUpperCase()}`;
}

/**
 * Generate international SEO data for an article
 */
export function generateInternationalSEOData(
  articleUrl: string,
  language: string,
  alternateVersions: MultilingualArticle[] = []
): InternationalSEOData {
  const hreflangLinks = generateHreflangLinks(
    articleUrl,
    language,
    alternateVersions
  );

  const availableLanguages = [
    language,
    ...alternateVersions.map((v) => v.language),
  ].filter((v, i, a) => a.indexOf(v) === i);

  return {
    hreflangLinks,
    defaultLanguage: "ar",
    availableLanguages,
    isRTL: isRTLLanguage(language),
  };
}
