import type { SEOFieldValidator } from "@/components/shared/seo-doctor";
import { createValidateSEOTitle } from "@/components/shared/seo-doctor/validators";
import type { SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import type { MediaRelation } from "./media-relation";
import { getFieldMapping } from "../client-field-mapping";

export const createValidateSEOTitleAndOG = (
  settings?: SEOSettings,
): SEOFieldValidator => {
  return (value, data) => {
    const seoTitleMapping = getFieldMapping("seoTitle");
    const seoTitleValidator = createValidateSEOTitle(settings);
    const seoTitleResult = seoTitleValidator(value, data);
    
    // Enhance message with mapping data if available
    let enhancedMessage = seoTitleResult.message;
    if (seoTitleMapping?.metaTags?.metaTagsPath) {
      enhancedMessage += ` → ${seoTitleMapping.metaTags.metaTagsPath}`;
    }

    const ogImageMedia = data.ogImageMedia as MediaRelation;
    const hasOGTitle =
      data.seoTitle &&
      typeof data.seoTitle === "string" &&
      data.seoTitle.trim().length > 0;
    const hasOGDescription =
      data.seoDescription &&
      typeof data.seoDescription === "string" &&
      data.seoDescription.trim().length > 0;
    const hasOGUrl =
      data.url && typeof data.url === "string" && data.url.trim().length > 0;
    const hasOGImage =
      ogImageMedia?.url &&
      typeof ogImageMedia.url === "string" &&
      ogImageMedia.url.trim().length > 0;
    const hasOGImageAlt =
      ogImageMedia?.altText &&
      typeof ogImageMedia.altText === "string" &&
      ogImageMedia.altText.trim().length > 0;
    const hasOGImageWidth =
      ogImageMedia?.width && typeof ogImageMedia.width === "number";
    const hasOGImageHeight =
      ogImageMedia?.height && typeof ogImageMedia.height === "number";

    let ogScore = 0;
    let ogMessage = "";

    if (hasOGTitle && hasOGDescription && hasOGUrl && hasOGImage) {
      ogMessage =
        "All essential OG tags can be generated (title, description, url, image, type)";
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
        ogMessage +=
          " - Add image alt text and dimensions for complete coverage";
      }
    } else {
      const missing = [];
      if (!hasOGTitle) missing.push("og:title");
      if (!hasOGDescription) missing.push("og:description");
      if (!hasOGUrl) missing.push("og:url");
      if (!hasOGImage) missing.push("og:image");
      if (hasOGImage && !hasOGImageAlt) missing.push("og:image:alt");
      if (hasOGImage && !hasOGImageWidth) missing.push("og:image:width");
      if (hasOGImage && !hasOGImageHeight) missing.push("og:image:height");

      ogScore =
        (hasOGTitle ? 3 : 0) +
        (hasOGDescription ? 3 : 0) +
        (hasOGUrl ? 2 : 0) +
        (hasOGImage ? 2 : 0) +
        (hasOGImageAlt ? 2 : 0) +
        (hasOGImageWidth ? 1 : 0) +
        (hasOGImageHeight ? 1 : 0);
      ogMessage = `Missing OG tags: ${missing.join(
        ", ",
      )} - add missing fields for complete social sharing`;
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
      message: `${enhancedMessage}. ${ogMessage}`,
      score: totalScore,
    };
  };
};

