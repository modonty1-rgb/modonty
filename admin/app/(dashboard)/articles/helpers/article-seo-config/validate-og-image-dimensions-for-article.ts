import type { SEOFieldValidator } from "@/components/shared/seo-doctor";
import type { MediaRelation } from "./media-relation";

export const validateOGImageDimensionsForArticle: SEOFieldValidator = (value, data) => {
  const featuredImage = data.featuredImage as MediaRelation;
  const hasOGImage = featuredImage?.url && typeof featuredImage.url === "string" && featuredImage.url.trim().length > 0;
  if (hasOGImage) {
    const hasWidth = featuredImage?.width && typeof featuredImage.width === "number";
    const hasHeight = featuredImage?.height && typeof featuredImage.height === "number";

    if (hasWidth && hasHeight) {
      const width = featuredImage.width as number;
      const height = featuredImage.height as number;
      if (width === 1200 && height === 630) {
        return {
          status: "good",
          message: "OG image dimensions optimal (1200x630px) - perfect for social sharing",
          score: 5,
        };
      } else if (width >= 600 && height >= 314) {
        return {
          status: "warning",
          message: `OG image dimensions (${width}x${height}px) - recommend 1200x630px for best results`,
          score: 3,
        };
      } else {
        return {
          status: "warning",
          message: `OG image dimensions (${width}x${height}px) too small - minimum 600x314px, recommend 1200x630px`,
          score: 1,
        };
      }
    } else if (hasWidth || hasHeight) {
      return {
        status: "warning",
        message: "OG image dimensions incomplete - both width and height needed",
        score: 1,
      };
    } else {
      return {
        status: "warning",
        message: "OG image dimensions missing - add width and height (1200x630px recommended)",
        score: 0,
      };
    }
  }
  return {
    status: "info",
    message: "OG image dimensions not needed (no OG image provided)",
    score: 0,
  };
};

