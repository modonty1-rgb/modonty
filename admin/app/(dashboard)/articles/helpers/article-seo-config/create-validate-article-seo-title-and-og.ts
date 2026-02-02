import type { SEOFieldValidator } from "@/components/shared/seo-doctor";
import { createValidateSEOTitle } from "@/components/shared/seo-doctor/validators";
import type { SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import type { MediaRelation } from "./media-relation";

export const createValidateArticleSEOTitleAndOG = (settings?: SEOSettings): SEOFieldValidator => {
  return (value, data) => {
    const seoTitleValidator = createValidateSEOTitle(settings);
    const seoTitleResult = seoTitleValidator(value, data);

    const featuredImage = data.featuredImage as MediaRelation;
    const hasOGTitle = data.seoTitle && typeof data.seoTitle === "string" && data.seoTitle.trim().length > 0;
    const hasOGDescription = data.seoDescription && typeof data.seoDescription === "string" && data.seoDescription.trim().length > 0;
    const hasOGImage = featuredImage?.url && typeof featuredImage.url === "string" && featuredImage.url.trim().length > 0;
    const hasOGImageAlt = featuredImage?.altText && typeof featuredImage.altText === "string" && featuredImage.altText.trim().length > 0;
    const hasOGImageWidth = featuredImage?.width && typeof featuredImage.width === "number";
    const hasOGImageHeight = featuredImage?.height && typeof featuredImage.height === "number";

    let ogScore = 0;
    let ogMessage = "";

    if (hasOGTitle && hasOGDescription && hasOGImage) {
      ogMessage = "All essential OG tags can be generated";
      ogScore = 10;

      if (hasOGImageAlt && hasOGImageWidth && hasOGImageHeight) {
        ogMessage += " - Complete with alt text and dimensions";
        ogScore = 15;
      } else if (hasOGImageAlt) {
        ogMessage += " - Add image dimensions (1200x630px recommended)";
        ogScore = 12;
      } else if (hasOGImageWidth && hasOGImageHeight) {
        ogMessage += " - Add image alt text for accessibility";
        ogScore = 12;
      } else {
        ogMessage += " - Add image alt text and dimensions for complete coverage";
      }
    } else {
      const missing = [];
      if (!hasOGTitle) missing.push("og:title");
      if (!hasOGDescription) missing.push("og:description");
      if (!hasOGImage) missing.push("og:image");
      if (hasOGImage && !hasOGImageAlt) missing.push("og:image:alt");
      if (hasOGImage && !hasOGImageWidth) missing.push("og:image:width");
      if (hasOGImage && !hasOGImageHeight) missing.push("og:image:height");

      ogScore =
        (hasOGTitle ? 3 : 0) +
        (hasOGDescription ? 3 : 0) +
        (hasOGImage ? 2 : 0) +
        (hasOGImageAlt ? 2 : 0) +
        (hasOGImageWidth ? 1 : 0) +
        (hasOGImageHeight ? 1 : 0);
      ogMessage = `Missing OG tags: ${missing.join(", ")} - add missing fields for complete social sharing`;
    }

    const totalScore = seoTitleResult.score + ogScore;

    let status: "good" | "warning" | "error" = "good";
    if (seoTitleResult.status === "error" || totalScore < 10) {
      status = "error";
    } else if (seoTitleResult.status === "warning" || totalScore < 20) {
      status = "warning";
    }

    return {
      status,
      message: `${seoTitleResult.message}. ${ogMessage}`,
      score: totalScore,
    };
  };
};

