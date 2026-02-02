import type { SEOFieldValidator } from "@/components/shared/seo-doctor";
import type { MediaRelation } from "./media-relation";

export const validateArticleOGTags: SEOFieldValidator = (value, data) => {
  const featuredImage = data.featuredImage as MediaRelation;
  const hasOGTitle = data.seoTitle && typeof data.seoTitle === "string" && data.seoTitle.trim().length > 0;
  const hasOGDescription = data.seoDescription && typeof data.seoDescription === "string" && data.seoDescription.trim().length > 0;
  const hasOGImage = featuredImage?.url && typeof featuredImage.url === "string" && featuredImage.url.trim().length > 0;
  const hasOGImageAlt = featuredImage?.altText && typeof featuredImage.altText === "string" && featuredImage.altText.trim().length > 0;
  const hasOGImageWidth = featuredImage?.width && typeof featuredImage.width === "number";
  const hasOGImageHeight = featuredImage?.height && typeof featuredImage.height === "number";

  if (hasOGTitle && hasOGDescription && hasOGImage) {
    let message = "All essential OG tags can be generated";
    let score = 10;

    if (hasOGImageAlt && hasOGImageWidth && hasOGImageHeight) {
      message += " - Complete with alt text and dimensions";
      score = 15;
    } else if (hasOGImageAlt) {
      message += " - Add image dimensions (1200x630px recommended)";
      score = 12;
    } else if (hasOGImageWidth && hasOGImageHeight) {
      message += " - Add image alt text for accessibility";
      score = 12;
    } else {
      message += " - Add image alt text and dimensions for complete coverage";
    }

    return {
      status: "good",
      message,
      score,
    };
  }

  const missing = [];
  if (!hasOGTitle) missing.push("og:title");
  if (!hasOGDescription) missing.push("og:description");
  if (!hasOGImage) missing.push("og:image");
  if (hasOGImage && !hasOGImageAlt) missing.push("og:image:alt");
  if (hasOGImage && !hasOGImageWidth) missing.push("og:image:width");
  if (hasOGImage && !hasOGImageHeight) missing.push("og:image:height");

  const partialScore =
    (hasOGTitle ? 3 : 0) +
    (hasOGDescription ? 3 : 0) +
    (hasOGImage ? 2 : 0) +
    (hasOGImageAlt ? 2 : 0) +
    (hasOGImageWidth ? 1 : 0) +
    (hasOGImageHeight ? 1 : 0);
  return {
    status: "warning",
    message: `Missing OG tags: ${missing.join(", ")} - add missing fields for complete social sharing`,
    score: partialScore,
  };
};

