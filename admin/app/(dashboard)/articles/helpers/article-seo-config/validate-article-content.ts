import type { SEOFieldValidator } from "@/components/shared/seo-doctor";
import { calculateWordCountImproved } from "../seo-helpers";

export const validateArticleContent: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    const wordCount = calculateWordCountImproved(value, "ar");
    if (wordCount >= 300) {
      return {
        status: "good",
        message: `Article content has ${wordCount} words - good depth for SEO`,
        score: 10,
      };
    } else if (wordCount >= 200) {
      return {
        status: "warning",
        message: `Article content has ${wordCount} words - aim for 300+ words for better SEO`,
        score: 5,
      };
    }
    return {
      status: "warning",
      message: `Article content too short (${wordCount} words) - minimum 300 words recommended`,
      score: 2,
    };
  }
  return {
    status: "error",
    message: "Article content is required",
    score: 0,
  };
};

