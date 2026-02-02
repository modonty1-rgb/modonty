/**
 * Content Quality Scorer - Phase 9
 *
 * Automated scoring system for article quality:
 * - Readability Score
 * - SEO Score
 * - E-E-A-T Score (Expertise, Experience, Authoritativeness, Trustworthiness)
 * - Media Quality Score
 * - Overall Content Score
 */

import { Article, Author, Media, ArticleFAQ, Category, Tag } from "@prisma/client";

export interface QualityScore {
  overall: number; // 0-100
  readability: ReadabilityScore;
  seo: SEOScore;
  eeat: EEATScore;
  media: MediaScore;
  recommendations: Recommendation[];
}

export interface ReadabilityScore {
  score: number; // 0-100
  avgSentenceLength: number;
  avgWordLength: number;
  paragraphCount: number;
  headingsCount: number;
  issues: string[];
}

export interface SEOScore {
  score: number; // 0-100
  titleLength: number;
  titleOptimal: boolean;
  descriptionLength: number;
  descriptionOptimal: boolean;
  hasCanonical: boolean;
  hasHeroImage: boolean;
  hasFAQs: boolean;
  wordCount: number;
  wordCountOptimal: boolean;
  issues: string[];
}

export interface EEATScore {
  score: number; // 0-100
  authorHasBio: boolean;
  authorHasImage: boolean;
  authorHasCredentials: boolean;
  authorHasExpertise: boolean;
  authorHasSocial: boolean;
  hasCitations: boolean;
  citationsCount: number;
  hasLastReviewed: boolean;
  issues: string[];
}

export interface MediaScore {
  score: number; // 0-100
  hasHeroImage: boolean;
  heroImageHasAlt: boolean;
  heroImageOptimalSize: boolean;
  galleryCount: number;
  allImagesHaveAlt: boolean;
  issues: string[];
}

export interface Recommendation {
  type: "critical" | "warning" | "suggestion";
  category: "readability" | "seo" | "eeat" | "media";
  message: string;
  action: string;
}

// Article type with relations for scoring
interface ArticleForScoring extends Article {
  author: Author;
  category?: Category | null;
  tags?: Array<{ tag: Tag }>;
  featuredImage?: Media | null;
  gallery?: Array<{ media: Media }>[];
  faqs?: ArticleFAQ[];
}

/**
 * Calculate readability score
 */
function calculateReadabilityScore(article: ArticleForScoring): ReadabilityScore {
  const issues: string[] = [];
  let score = 100;

  // Extract text from content
  const plainText = article.content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = plainText.split(/\s+/).filter((w) => w.length > 0);
  const sentences = plainText.split(/[.،。!؟?]/).filter((s) => s.trim().length > 0);
  const paragraphs = article.content.split(/<\/p>/i).length - 1 || 1;
  const headings = (article.content.match(/<h[1-6][^>]*>/gi) || []).length;

  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
  const avgWordLength =
    words.length > 0
      ? words.reduce((sum, w) => sum + w.length, 0) / words.length
      : 0;

  // Sentence length check (optimal: 15-25 words)
  if (avgSentenceLength > 30) {
    score -= 15;
    issues.push("الجمل طويلة جداً (متوسط > 30 كلمة)");
  } else if (avgSentenceLength < 8) {
    score -= 10;
    issues.push("الجمل قصيرة جداً (متوسط < 8 كلمات)");
  }

  // Paragraph count check
  if (paragraphs < 3) {
    score -= 10;
    issues.push("عدد الفقرات قليل (أقل من 3)");
  }

  // Headings check
  if (headings === 0) {
    score -= 15;
    issues.push("لا توجد عناوين فرعية (H2-H6)");
  } else if (headings < 2 && words.length > 500) {
    score -= 10;
    issues.push("عدد العناوين قليل للمحتوى الطويل");
  }

  return {
    score: Math.max(0, score),
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    paragraphCount: paragraphs,
    headingsCount: headings,
    issues,
  };
}

/**
 * Calculate SEO score
 */
function calculateSEOScore(article: ArticleForScoring): SEOScore {
  const issues: string[] = [];
  let score = 100;

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt || "";
  const wordCount = article.wordCount || 0;

  // Title length (optimal: 30-60)
  const titleOptimal = title.length >= 30 && title.length <= 60;
  if (title.length < 30) {
    score -= 10;
    issues.push(`العنوان قصير (${title.length} حرف، الأفضل: 30-60)`);
  } else if (title.length > 70) {
    score -= 5;
    issues.push(`العنوان طويل جداً (${title.length} حرف)`);
  }

  // Description length (optimal: 120-160)
  const descriptionOptimal = description.length >= 120 && description.length <= 160;
  if (description.length < 120) {
    score -= 10;
    issues.push(`الوصف قصير (${description.length} حرف، الأفضل: 120-160)`);
  } else if (description.length > 170) {
    score -= 5;
    issues.push(`الوصف طويل (${description.length} حرف)`);
  }

  // Canonical URL
  const hasCanonical = !!article.canonicalUrl;
  if (!hasCanonical) {
    score -= 5;
    issues.push("لا يوجد canonical URL");
  }

  // Hero image
  const hasHeroImage = !!article.featuredImageId;
  if (!hasHeroImage) {
    score -= 15;
    issues.push("لا توجد صورة رئيسية");
  }

  // FAQs
  const hasFAQs = (article.faqs?.length ?? 0) > 0;
  if (!hasFAQs) {
    score -= 5;
    issues.push("لا توجد أسئلة شائعة (FAQs)");
  }

  // Word count (optimal: 1000-3000)
  const wordCountOptimal = wordCount >= 1000 && wordCount <= 3000;
  if (wordCount < 300) {
    score -= 20;
    issues.push(`المحتوى قصير جداً (${wordCount} كلمة)`);
  } else if (wordCount < 800) {
    score -= 10;
    issues.push(`المحتوى قصير (${wordCount} كلمة، الأفضل: 1000+)`);
  }

  return {
    score: Math.max(0, score),
    titleLength: title.length,
    titleOptimal,
    descriptionLength: description.length,
    descriptionOptimal,
    hasCanonical,
    hasHeroImage,
    hasFAQs,
    wordCount,
    wordCountOptimal,
    issues,
  };
}

/**
 * Calculate E-E-A-T score
 */
function calculateEEATScore(article: ArticleForScoring): EEATScore {
  const issues: string[] = [];
  let score = 100;

  const author = article.author;

  // Author bio
  const authorHasBio = !!author.bio && author.bio.length > 50;
  if (!authorHasBio) {
    score -= 15;
    issues.push("الكاتب بدون سيرة ذاتية مفصلة");
  }

  // Author image
  const authorHasImage = !!author.image;
  if (!authorHasImage) {
    score -= 10;
    issues.push("الكاتب بدون صورة شخصية");
  }

  // Author credentials
  const authorHasCredentials =
    (author.credentials?.length ?? 0) > 0 || (author.qualifications?.length ?? 0) > 0;
  if (!authorHasCredentials) {
    score -= 10;
    issues.push("الكاتب بدون شهادات أو مؤهلات");
  }

  // Author expertise
  const authorHasExpertise = (author.expertiseAreas?.length ?? 0) > 0;
  if (!authorHasExpertise) {
    score -= 10;
    issues.push("الكاتب بدون مجالات خبرة محددة");
  }

  // Author social profiles
  const authorHasSocial = !!(author.linkedIn || author.twitter || (author.sameAs?.length ?? 0) > 0);
  if (!authorHasSocial) {
    score -= 10;
    issues.push("الكاتب بدون روابط اجتماعية للتحقق");
  }

  // Citations
  const citationsCount = article.citations?.length ?? 0;
  const hasCitations = citationsCount > 0;
  if (!hasCitations) {
    score -= 15;
    issues.push("لا توجد مصادر أو اقتباسات");
  }

  // Last reviewed date
  const hasLastReviewed = !!article.lastReviewed;
  if (!hasLastReviewed) {
    score -= 5;
    issues.push("لا يوجد تاريخ آخر مراجعة");
  }

  return {
    score: Math.max(0, score),
    authorHasBio,
    authorHasImage,
    authorHasCredentials,
    authorHasExpertise,
    authorHasSocial,
    hasCitations,
    citationsCount,
    hasLastReviewed,
    issues,
  };
}

/**
 * Calculate media score
 */
function calculateMediaScore(article: ArticleForScoring): MediaScore {
  const issues: string[] = [];
  let score = 100;

  const heroImage = article.featuredImage;

  // Hero image presence
  const hasHeroImage = !!heroImage;
  if (!hasHeroImage) {
    score -= 25;
    issues.push("لا توجد صورة رئيسية");
  }

  // Hero image alt text
  const heroImageHasAlt = !!heroImage?.altText;
  if (hasHeroImage && !heroImageHasAlt) {
    score -= 15;
    issues.push("الصورة الرئيسية بدون نص بديل (alt)");
  }

  // Hero image size (optimal: 1200x630 for OG)
  const heroImageOptimalSize =
    (heroImage?.width ?? 0) >= 1200 && (heroImage?.height ?? 0) >= 630;
  if (hasHeroImage && !heroImageOptimalSize) {
    score -= 10;
    issues.push("الصورة الرئيسية أصغر من الحجم المثالي (1200x630)");
  }

  // Gallery images
  const galleryCount = article.gallery?.length ?? 0;

  // Check all images have alt text
  const allImagesHaveAlt =
    heroImageHasAlt &&
    (article.gallery?.every((item) => !!(item as unknown as { media: Media }).media?.altText) ?? true);

  if (!allImagesHaveAlt) {
    score -= 10;
    issues.push("بعض الصور بدون نص بديل");
  }

  return {
    score: Math.max(0, score),
    hasHeroImage,
    heroImageHasAlt,
    heroImageOptimalSize,
    galleryCount,
    allImagesHaveAlt,
    issues,
  };
}

/**
 * Generate recommendations based on scores
 */
function generateRecommendations(
  readability: ReadabilityScore,
  seo: SEOScore,
  eeat: EEATScore,
  media: MediaScore
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Critical issues (score < 60)
  if (seo.score < 60) {
    if (!seo.hasHeroImage) {
      recommendations.push({
        type: "critical",
        category: "seo",
        message: "المقال بدون صورة رئيسية",
        action: "أضف صورة رئيسية بحجم 1200×630 مع نص بديل",
      });
    }
    if (seo.wordCount < 300) {
      recommendations.push({
        type: "critical",
        category: "seo",
        message: "المحتوى قصير جداً للترتيب في محركات البحث",
        action: "أضف محتوى إضافي (الحد الأدنى 800 كلمة)",
      });
    }
  }

  if (eeat.score < 60) {
    if (!eeat.authorHasBio) {
      recommendations.push({
        type: "critical",
        category: "eeat",
        message: "الكاتب بدون سيرة ذاتية",
        action: "أضف سيرة ذاتية للكاتب (50+ حرف)",
      });
    }
    if (!eeat.hasCitations) {
      recommendations.push({
        type: "critical",
        category: "eeat",
        message: "لا توجد مصادر للمعلومات",
        action: "أضف روابط لمصادر موثوقة",
      });
    }
  }

  // Warnings (score 60-80)
  if (readability.headingsCount === 0) {
    recommendations.push({
      type: "warning",
      category: "readability",
      message: "لا توجد عناوين فرعية",
      action: "أضف عناوين H2 و H3 لتنظيم المحتوى",
    });
  }

  if (!seo.hasFAQs) {
    recommendations.push({
      type: "suggestion",
      category: "seo",
      message: "لا توجد أسئلة شائعة",
      action: "أضف 3-5 أسئلة شائعة للحصول على FAQ rich results",
    });
  }

  // Suggestions (optimization)
  if (!eeat.authorHasSocial) {
    recommendations.push({
      type: "suggestion",
      category: "eeat",
      message: "الكاتب بدون روابط اجتماعية",
      action: "أضف رابط LinkedIn أو Twitter للتحقق",
    });
  }

  return recommendations;
}

/**
 * Calculate overall content quality score
 */
export function scoreArticleQuality(article: ArticleForScoring): QualityScore {
  const readability = calculateReadabilityScore(article);
  const seo = calculateSEOScore(article);
  const eeat = calculateEEATScore(article);
  const media = calculateMediaScore(article);

  // Weighted average
  const overall = Math.round(
    readability.score * 0.2 + seo.score * 0.35 + eeat.score * 0.3 + media.score * 0.15
  );

  const recommendations = generateRecommendations(readability, seo, eeat, media);

  return {
    overall,
    readability,
    seo,
    eeat,
    media,
    recommendations,
  };
}

/**
 * Get score label and color
 */
export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "ممتاز", color: "green" };
  if (score >= 75) return { label: "جيد جداً", color: "blue" };
  if (score >= 60) return { label: "جيد", color: "yellow" };
  if (score >= 40) return { label: "يحتاج تحسين", color: "orange" };
  return { label: "ضعيف", color: "red" };
}
