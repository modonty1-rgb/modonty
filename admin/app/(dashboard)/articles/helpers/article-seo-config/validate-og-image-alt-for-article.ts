import type { SEOFieldValidator } from "@/components/shared/seo-doctor";
import type { MediaRelation } from "./media-relation";

export const validateOGImageAltForArticle: SEOFieldValidator = (value, data) => {
  const featuredImage = data.featuredImage as MediaRelation;
  const hasOGImage = featuredImage?.url && typeof featuredImage.url === "string" && featuredImage.url.trim().length > 0;
  if (hasOGImage) {
    if (featuredImage?.altText && typeof featuredImage.altText === "string" && featuredImage.altText.trim().length > 0) {
      return {
        status: "good",
        message: "OG image alt text provided - required for accessibility and SEO",
        score: 5,
      };
    }
    return {
      status: "error",
      message: "OG image alt text required when OG image exists (accessibility + SEO)",
      score: 0,
    };
  }
  return {
    status: "info",
    message: "OG image alt text not needed (no OG image provided)",
    score: 0,
  };
};

