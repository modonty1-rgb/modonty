import type { SEOFieldValidator } from "@/components/shared/seo-doctor";

export const validateArticleDatePublished: SEOFieldValidator = (value, data) => {
  if (data.status === "PUBLISHED") {
    if (value) {
      return {
        status: "good",
        message: "Publication date set - required for published articles",
        score: 10,
      };
    }
    return {
      status: "error",
      message: "Publication date required for published articles",
      score: 0,
    };
  }
  return {
    status: "info",
    message: "Publication date will be set when article is published",
    score: 0,
  };
};

