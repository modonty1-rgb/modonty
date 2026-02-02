import type { SEOFieldValidator } from "@/components/shared/seo-doctor";

export const validateArticleCategory: SEOFieldValidator = (value, data) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    return {
      status: "good",
      message: "Category assigned - improves organization and SEO",
      score: 5,
    };
  }
  return {
    status: "warning",
    message: "Category recommended - improves organization and SEO",
    score: 0,
  };
};

