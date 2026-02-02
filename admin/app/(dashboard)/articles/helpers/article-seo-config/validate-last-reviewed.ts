import type { SEOFieldValidator } from "@/components/shared/seo-doctor";

export const validateLastReviewed: SEOFieldValidator = (value) => {
  if (value) {
    return {
      status: "good",
      message: "Last reviewed date set - shows content freshness for SEO",
      score: 5,
    };
  }
  return {
    status: "warning",
    message: "Last reviewed date recommended - update when content is reviewed/updated",
    score: 0,
  };
};

