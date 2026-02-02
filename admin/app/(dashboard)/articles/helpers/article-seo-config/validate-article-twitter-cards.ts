import type { SEOFieldValidator } from "@/components/shared/seo-doctor";
import type { MediaRelation } from "./media-relation";

export const validateArticleTwitterCards: SEOFieldValidator = (value, data) => {
  const hasTwitterCard = data.twitterCard && typeof data.twitterCard === "string" && data.twitterCard.trim().length > 0;
  const hasTwitterTitle = data.twitterTitle && typeof data.twitterTitle === "string" && data.twitterTitle.trim().length > 0;
  const hasTwitterDesc =
    data.twitterDescription && typeof data.twitterDescription === "string" && data.twitterDescription.trim().length > 0;
  const hasTwitterImg = data.twitterImage && typeof data.twitterImage === "string" && data.twitterImage.trim().length > 0;
  const hasTwitterImageAlt =
    data.twitterImageAlt && typeof data.twitterImageAlt === "string" && data.twitterImageAlt.trim().length > 0;
  const featuredImage = data.featuredImage as MediaRelation;
  const canAutoGenerate = data.seoTitle && data.seoDescription && featuredImage?.url;

  if (hasTwitterCard && hasTwitterTitle && hasTwitterDesc && hasTwitterImg) {
    let message = "Complete Twitter Cards configured - optimal for social SEO";
    let score = 10;

    if (hasTwitterImageAlt) {
      message += " - Includes alt text for accessibility";
      score = 15;
    } else {
      message += " - Add image alt text for accessibility and SEO";
    }

    return {
      status: "good",
      message,
      score,
    };
  } else if (canAutoGenerate) {
    return {
      status: "warning",
      message: "Twitter Cards can be auto-generated from existing fields - add for better social SEO",
      score: 5,
    };
  }
  return {
    status: "warning",
    message: "Twitter Cards recommended for social SEO signals - improves engagement and CTR",
    score: 0,
  };
};

