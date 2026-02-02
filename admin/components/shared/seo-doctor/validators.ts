import { SEOFieldValidator } from "./seo-doctor";
import type { SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

// Shared validators used across multiple divisions

export const validateSlug: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    return {
      status: "good",
      message: "URL-friendly slug is set",
      score: 5,
    };
  }
  return {
    status: "error",
    message: "Slug is required (auto-generated from name)",
    score: 0,
  };
};

export const createValidateSEOTitle = (settings?: SEOSettings): SEOFieldValidator => {
  const min = settings?.seoTitleMin ?? 30;
  const max = settings?.seoTitleMax ?? 60;
  const restrict = settings?.seoTitleRestrict ?? false;

  return (value) => {
    if (value && typeof value === "string" && value.trim().length > 0) {
      const titleLength = value.length;
      if (titleLength >= min && titleLength <= max) {
        return {
          status: "good",
          message: `Perfect length (${titleLength} chars) - optimal for search results`,
          score: 15,
        };
      } else if (titleLength >= min * 0.6 && titleLength < min) {
        return {
          status: "warning",
          message: `Too short (${titleLength} chars) - aim for ${min}-${max} chars for better visibility`,
          score: 10,
        };
      } else if (titleLength > max && titleLength <= max * 1.17) {
        const status = restrict ? "error" : "warning";
        return {
          status,
          message: restrict
            ? `Too long (${titleLength} chars) - exceeds maximum of ${max} chars`
            : `Slightly long (${titleLength} chars) - may be truncated in search results`,
          score: restrict ? 0 : 12,
        };
      } else if (titleLength > max * 1.17) {
        const status = restrict ? "error" : "warning";
        return {
          status,
          message: restrict
            ? `Too long (${titleLength} chars) - exceeds maximum of ${max} chars`
            : `Too long (${titleLength} chars) - will be truncated, aim for ${min}-${max} chars`,
          score: restrict ? 0 : 8,
        };
      } else {
        return {
          status: "error",
          message: `Too short (${titleLength} chars) - minimum ${min} chars recommended`,
          score: 5,
        };
      }
    }
    return {
      status: "error",
      message: "SEO title is missing - critical for search visibility",
      score: 0,
    };
  };
};

export const validateSEOTitle: SEOFieldValidator = (value, data) => {
  return createValidateSEOTitle()(value, data);
};

export const createValidateSEODescription = (settings?: SEOSettings): SEOFieldValidator => {
  const min = settings?.seoDescriptionMin ?? 120;
  const max = settings?.seoDescriptionMax ?? 160;
  const restrict = settings?.seoDescriptionRestrict ?? false;

  return (value) => {
    if (value && typeof value === "string" && value.trim().length > 0) {
      const descLength = value.length;
      if (descLength >= min && descLength <= max) {
        return {
          status: "good",
          message: `Perfect length (${descLength} chars) - optimal for search snippets`,
          score: 15,
        };
      } else if (descLength >= min * 0.8 && descLength < min) {
        return {
          status: "warning",
          message: `Good but could be longer (${descLength} chars) - aim for ${min}-${max} chars`,
          score: 12,
        };
      } else if (descLength > max && descLength <= max * 1.125) {
        const status = restrict ? "error" : "warning";
        return {
          status,
          message: restrict
            ? `Too long (${descLength} chars) - exceeds maximum of ${max} chars`
            : `Slightly long (${descLength} chars) - may be truncated, aim for ${min}-${max} chars`,
          score: restrict ? 0 : 10,
        };
      } else if (descLength > max * 1.125) {
        const status = restrict ? "error" : "warning";
        return {
          status,
          message: restrict
            ? `Too long (${descLength} chars) - exceeds maximum of ${max} chars`
            : `Too long (${descLength} chars) - will be truncated, aim for ${min}-${max} chars`,
          score: restrict ? 0 : 8,
        };
      } else {
        return {
          status: "error",
          message: `Too short (${descLength} chars) - minimum ${min} chars recommended`,
          score: 5,
        };
      }
    }
    return {
      status: "error",
      message: "SEO description is missing - critical for click-through rate",
      score: 0,
    };
  };
};

export const validateSEODescription: SEOFieldValidator = (value, data) => {
  return createValidateSEODescription()(value, data);
};

export const validateOGImage: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    return {
      status: "good",
      message: "Open Graph image set for social sharing",
      score: 5,
    };
  }
  return {
    status: "warning",
    message: "OG image recommended (1200x630px) for social media",
    score: 0,
  };
};

export const validateOGImageAlt: SEOFieldValidator = (value, data) => {
  const hasOGImage = data.ogImage && typeof data.ogImage === "string" && data.ogImage.trim().length > 0;
  if (hasOGImage) {
    if (value && typeof value === "string" && value.trim().length > 0) {
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

export const validateOGImageDimensions: SEOFieldValidator = (value, data) => {
  const hasOGImage = data.ogImage && typeof data.ogImage === "string" && data.ogImage.trim().length > 0;
  if (hasOGImage) {
    const hasWidth = data.ogImageWidth && typeof data.ogImageWidth === "number";
    const hasHeight = data.ogImageHeight && typeof data.ogImageHeight === "number";
    
    if (hasWidth && hasHeight) {
      const width = data.ogImageWidth as number;
      const height = data.ogImageHeight as number;
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
      }
      return {
        status: "warning",
        message: `OG image dimensions (${width}x${height}px) - recommend 1200x630px minimum`,
        score: 2,
      };
    } else if (hasWidth || hasHeight) {
      return {
        status: "warning",
        message: "OG image dimensions incomplete - add both width and height (recommend 1200x630px)",
        score: 1,
      };
    }
    return {
      status: "warning",
      message: "OG image dimensions recommended (1200x630px) for proper social media rendering",
      score: 0,
    };
  }
  return {
    status: "info",
    message: "OG image dimensions not needed (no OG image provided)",
    score: 0,
  };
};

export const validateOGTags: SEOFieldValidator = (value, data) => {
  const hasOGTitle = data.seoTitle && typeof data.seoTitle === "string" && data.seoTitle.trim().length > 0;
  const hasOGDescription = data.seoDescription && typeof data.seoDescription === "string" && data.seoDescription.trim().length > 0;
  const hasOGUrl = data.url && typeof data.url === "string" && data.url.trim().length > 0;
  const hasOGImage = data.ogImage && typeof data.ogImage === "string" && data.ogImage.trim().length > 0;
  const hasOGImageAlt = data.ogImageAlt && typeof data.ogImageAlt === "string" && data.ogImageAlt.trim().length > 0;
  const hasOGImageWidth = data.ogImageWidth && typeof data.ogImageWidth === "number";
  const hasOGImageHeight = data.ogImageHeight && typeof data.ogImageHeight === "number";
  
  if (hasOGTitle && hasOGDescription && hasOGUrl && hasOGImage) {
    let message = "All essential OG tags can be generated (title, description, url, image, type)";
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
  if (!hasOGUrl) missing.push("og:url");
  if (!hasOGImage) missing.push("og:image");
  if (hasOGImage && !hasOGImageAlt) missing.push("og:image:alt");
  if (hasOGImage && !hasOGImageWidth) missing.push("og:image:width");
  if (hasOGImage && !hasOGImageHeight) missing.push("og:image:height");
  
  const partialScore = (hasOGTitle ? 3 : 0) + (hasOGDescription ? 3 : 0) + (hasOGUrl ? 2 : 0) + (hasOGImage ? 2 : 0) + 
                      (hasOGImageAlt ? 2 : 0) + (hasOGImageWidth ? 1 : 0) + (hasOGImageHeight ? 1 : 0);
  return {
    status: "warning",
    message: `Missing OG tags: ${missing.join(", ")} - add missing fields for complete social sharing`,
    score: partialScore,
  };
};

export const createValidateTwitterTitle = (settings?: SEOSettings): SEOFieldValidator => {
  const max = settings?.twitterTitleMax ?? 70;
  const restrict = settings?.twitterTitleRestrict ?? true;

  return (value) => {
    if (value && typeof value === "string" && value.trim().length > 0) {
      const titleLength = value.length;
      if (titleLength <= max) {
        return {
          status: "good",
          message: `Perfect length (${titleLength} chars) - within Twitter display limit`,
          score: 10,
        };
      } else {
        const status = restrict ? "error" : "warning";
        return {
          status,
          message: restrict
            ? `Too long (${titleLength} chars) - exceeds maximum of ${max} chars (Twitter will truncate)`
            : `Too long (${titleLength} chars) - Twitter will truncate beyond ${max} chars`,
          score: restrict ? 0 : 5,
        };
      }
    }
    return {
      status: "warning",
      message: "Twitter title recommended for social SEO",
      score: 0,
    };
  };
};

export const createValidateTwitterDescription = (settings?: SEOSettings): SEOFieldValidator => {
  const max = settings?.twitterDescriptionMax ?? 200;
  const restrict = settings?.twitterDescriptionRestrict ?? true;

  return (value) => {
    if (value && typeof value === "string" && value.trim().length > 0) {
      const descLength = value.length;
      if (descLength <= max) {
        return {
          status: "good",
          message: `Perfect length (${descLength} chars) - within Twitter display limit`,
          score: 10,
        };
      } else {
        const status = restrict ? "error" : "warning";
        return {
          status,
          message: restrict
            ? `Too long (${descLength} chars) - exceeds maximum of ${max} chars (Twitter will truncate)`
            : `Too long (${descLength} chars) - Twitter will truncate beyond ${max} chars`,
          score: restrict ? 0 : 5,
        };
      }
    }
    return {
      status: "warning",
      message: "Twitter description recommended for social SEO",
      score: 0,
    };
  };
};

export const validateTwitterCards: SEOFieldValidator = (value, data) => {
  const hasTwitterCard = data.twitterCard && typeof data.twitterCard === "string" && data.twitterCard.trim().length > 0;
  const hasTwitterTitle = data.twitterTitle && typeof data.twitterTitle === "string" && data.twitterTitle.trim().length > 0;
  const hasTwitterDesc = data.twitterDescription && typeof data.twitterDescription === "string" && data.twitterDescription.trim().length > 0;
  const hasTwitterImg = data.twitterImage && typeof data.twitterImage === "string" && data.twitterImage.trim().length > 0;
  const hasTwitterImageAlt = data.twitterImageAlt && typeof data.twitterImageAlt === "string" && data.twitterImageAlt.trim().length > 0;
  const canAutoGenerate = data.seoTitle && data.seoDescription && data.ogImage;
  
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

export const validateTwitterImageAlt: SEOFieldValidator = (value, data) => {
  const hasTwitterImage = data.twitterImage && typeof data.twitterImage === "string" && data.twitterImage.trim().length > 0;
  if (hasTwitterImage) {
    if (value && typeof value === "string" && value.trim().length > 0) {
      return {
        status: "good",
        message: "Twitter image alt text provided - required for accessibility and SEO",
        score: 5,
      };
    }
    return {
      status: "error",
      message: "Twitter image alt text required when Twitter image exists (accessibility + SEO)",
      score: 0,
    };
  }
  return {
    status: "info",
    message: "Twitter image alt text not needed (no Twitter image provided)",
    score: 0,
  };
};

export const validateUrl: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    const isValidUrl = /^https?:\/\/.+\..+/.test(value);
    if (isValidUrl) {
      return {
        status: "good",
        message: "URL is valid",
        score: 5,
      };
    }
    return {
      status: "warning",
      message: "URL format is invalid - should start with http:// or https://",
      score: 0,
    };
  }
  return {
    status: "info",
    message: "URL is optional",
    score: 0,
  };
};

export const validateCanonicalUrl: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    const isValidCanonical = /^https?:\/\/.+\..+/.test(value);
    if (isValidCanonical) {
      return {
        status: "good",
        message: "Canonical URL set - prevents duplicate content issues",
        score: 5,
      };
    }
    return {
      status: "warning",
      message: "Canonical URL format invalid - should be full URL (https://example.com/page)",
      score: 0,
    };
  }
  return {
    status: "warning",
    message: "Canonical URL recommended - prevents duplicate content and consolidates ranking signals",
    score: 0,
  };
};

export const validateImageAlt: SEOFieldValidator = (value, data) => {
  const hasImage = data.image && typeof data.image === "string" && data.image.trim().length > 0;
  if (hasImage) {
    if (value && typeof value === "string" && value.trim().length > 0) {
      return {
        status: "good",
        message: "Image alt text provided - required for accessibility and SEO",
        score: 5,
      };
    }
    return {
      status: "error",
      message: "Image alt text required when image exists (accessibility + SEO)",
      score: 0,
    };
  }
  return {
    status: "info",
    message: "Image alt text not needed (no image provided)",
    score: 0,
  };
};
