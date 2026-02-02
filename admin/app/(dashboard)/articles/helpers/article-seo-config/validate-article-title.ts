import type { SEOFieldValidator } from "@/components/shared/seo-doctor";

export const validateArticleTitle: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    return {
      status: "good",
      message: "Article title is set",
      score: 5,
    };
  }
  return {
    status: "error",
    message: "Article title is required",
    score: 0,
  };
};

