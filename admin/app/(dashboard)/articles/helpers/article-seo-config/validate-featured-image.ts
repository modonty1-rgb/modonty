import type { SEOFieldValidator } from "@/components/shared/seo-doctor";
import type { MediaRelation } from "./media-relation";

export const validateFeaturedImage: SEOFieldValidator = (value, data) => {
  const featuredImage = data.featuredImage as MediaRelation;
  const hasImage = featuredImage?.url && typeof featuredImage.url === "string" && featuredImage.url.trim().length > 0;
  if (hasImage) {
    const hasAlt = featuredImage?.altText && typeof featuredImage.altText === "string" && featuredImage.altText.trim().length > 0;
    if (hasAlt) {
      return {
        status: "good",
        message: "Featured image with alt text provided - required for SEO",
        score: 10,
      };
    }
    return {
      status: "error",
      message: "Featured image alt text required when image exists (accessibility + SEO)",
      score: 5,
    };
  }
  return {
    status: "warning",
    message: "Featured image recommended (1200x630px) for social sharing and SEO",
    score: 0,
  };
};

