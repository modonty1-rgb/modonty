import {
  ArticleSEOInput,
  ArticleSEOScoreResult,
  ArticleSEOCategory,
} from "../article-seo-types";
import { normalizeInput } from "./normalize-input";
import { analyzeMetaTags } from "./analyze-meta-tags";
import { analyzeContent } from "./analyze-content";
import { analyzeImages } from "./analyze-images";
import { analyzeStructuredData } from "./analyze-structured-data";
import { analyzeTechnical } from "./analyze-technical";
import { analyzeSocial } from "./analyze-social";

export function analyzeArticleSEO(
  input: ArticleSEOInput
): ArticleSEOScoreResult {
  try {
    const normalized = normalizeInput(input);

    // Empty-form guard: return 0% when the article has no meaningful content yet.
    // Avoids the misleading "18% SEO Health" on a brand-new article and prevents
    // partial-credit false positives from default values.
    const hasTitle = Boolean((input.title ?? '').trim());
    const hasContent = Boolean((input.content ?? '').trim());
    const isEssentiallyEmpty = !hasTitle && !hasContent;

    if (isEssentiallyEmpty) {
      const emptyCategory: ArticleSEOCategory = {
        score: 0,
        maxScore: 0,
        percentage: 0,
        passed: 0,
        total: 0,
      };
      return {
        score: 0,
        percentage: 0,
        categories: {
          metaTags: emptyCategory,
          content: emptyCategory,
          images: emptyCategory,
          structuredData: emptyCategory,
          technical: emptyCategory,
          social: emptyCategory,
        },
      };
    }

    const categories = {
      metaTags: analyzeMetaTags(normalized),
      content: analyzeContent(normalized),
      images: analyzeImages(normalized),
      structuredData: analyzeStructuredData(normalized),
      technical: analyzeTechnical(normalized),
      social: analyzeSocial(normalized),
    };

    const totalMaxScore = Object.values(categories).reduce(
      (sum, cat) => sum + cat.maxScore,
      0
    );
    // Calculate weighted average of category percentages
    const weightedSum = Object.values(categories).reduce(
      (sum, cat) => sum + (cat.percentage * cat.maxScore),
      0
    );
    const score = totalMaxScore > 0 
      ? Math.round(weightedSum / totalMaxScore)
      : 0;

    return {
      score,
      percentage: score,
      categories,
    };
  } catch (error) {
    console.error("Error analyzing article SEO:", error);

    const emptyCategory: ArticleSEOCategory = {
      score: 0,
      maxScore: 0,
      percentage: 0,
      passed: 0,
      total: 0,
    };

    return {
      score: 0,
      percentage: 0,
      categories: {
        metaTags: emptyCategory,
        content: emptyCategory,
        images: emptyCategory,
        structuredData: emptyCategory,
        technical: emptyCategory,
        social: emptyCategory,
      },
    };
  }
}
