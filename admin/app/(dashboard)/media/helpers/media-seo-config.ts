import { SEOFieldConfig, SEODoctorConfig, SEOFieldValidator } from "@/components/shared/seo-doctor";

const validateAltText: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    const altLength = value.trim().length;
    if (altLength >= 5 && altLength <= 125) {
      return {
        status: "good",
        message: `Alt text is set (${altLength} chars) - optimal for SEO and accessibility`,
        score: 25,
      };
    } else if (altLength < 5) {
      return {
        status: "warning",
        message: `Alt text too short (${altLength} chars) - aim for 5-125 chars for better SEO`,
        score: 15,
      };
    } else {
      return {
        status: "warning",
        message: `Alt text too long (${altLength} chars) - may be truncated, aim for 5-125 chars`,
        score: 15,
      };
    }
  }
  return {
    status: "error",
    message: "Alt text is required - critical for accessibility and SEO",
    score: 0,
  };
};

const validateTitle: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    return {
      status: "good",
      message: "Title is set - used in Schema.org ImageObject",
      score: 15,
    };
  }
  return {
    status: "warning",
    message: "Title recommended for Schema.org ImageObject",
    score: 0,
  };
};

const validateDescription: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    const descLength = value.trim().length;
    if (descLength >= 50 && descLength <= 160) {
      return {
        status: "good",
        message: `Description is set (${descLength} chars) - optimal for meta descriptions`,
        score: 15,
      };
    } else if (descLength < 50) {
      return {
        status: "warning",
        message: `Description too short (${descLength} chars) - aim for 50-160 chars`,
        score: 12,
      };
    } else {
      return {
        status: "warning",
        message: `Description too long (${descLength} chars) - may be truncated, aim for 50-160 chars`,
        score: 12,
      };
    }
  }
  return {
    status: "warning",
    message: "Description recommended for meta descriptions and Schema.org",
    score: 0,
  };
};

// Keywords validator removed - keywords field has been completely removed from the system
// Keywords should be naturally incorporated into alt text, title, and description

const validateDimensions: SEOFieldValidator = (value, data) => {
  const width = data.width && typeof data.width === "number" ? data.width : null;
  const height = data.height && typeof data.height === "number" ? data.height : null;
  
  if (width && height) {
    if (width >= 1200 && height >= 800) {
      return {
        status: "good",
        message: `Optimal dimensions (${width}×${height}px) - good for web and social sharing`,
        score: 10,
      };
    } else if (width >= 800 && height >= 600) {
      return {
        status: "warning",
        message: `Dimensions (${width}×${height}px) - recommend 1200×800px minimum for best results`,
        score: 9,
      };
    } else {
      return {
        status: "warning",
        message: `Small dimensions (${width}×${height}px) - may not display well on all devices`,
        score: 7,
      };
    }
  }
  return {
    status: "warning",
    message: "Image dimensions recommended for proper rendering and SEO",
    score: 0,
  };
};

const validateFilename: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    const filename = value.trim().toLowerCase();
    const genericPatterns = [
      /^img[_\-\d]+/i,
      /^dsc[_\-\d]+/i,
      /^photo[_\-\d]+/i,
      /^image[_\-\d]+/i,
      /^untitled/i,
      /^screenshot/i,
      /^snap/i,
    ];
    
    const isGeneric = genericPatterns.some((pattern) => pattern.test(filename));
    const hasHyphens = filename.includes("-");
    const hasUnderscores = filename.includes("_");
    const hasSpaces = filename.includes(" ");
    
    if (isGeneric) {
      return {
        status: "warning",
        message: "Filename appears generic (IMG_1234, DSC_001, etc.) - use descriptive names for SEO",
        score: 6,
      };
    } else if (hasSpaces) {
      return {
        status: "warning",
        message: "Filename contains spaces - use hyphens instead for better SEO",
        score: 7,
      };
    } else if (hasUnderscores && !hasHyphens) {
      return {
        status: "warning",
        message: "Filename uses underscores - hyphens are better for SEO",
        score: 8,
      };
    } else if (hasHyphens || filename.length > 10) {
      return {
        status: "good",
        message: "SEO-friendly filename - descriptive and well-formatted",
        score: 10,
      };
    } else {
      return {
        status: "warning",
        message: "Filename too short - use descriptive names for better SEO",
        score: 5,
      };
    }
  }
  return {
    status: "error",
    message: "Filename is required",
    score: 0,
  };
};

const validateCloudinaryPublicId: SEOFieldValidator = (value, data) => {
  const publicId = value && typeof value === "string" ? value : null;
  const filename = data.filename && typeof data.filename === "string" ? data.filename : "";
  
  if (publicId) {
    const isSEOFriendly = !publicId.match(/^(img|dsc|photo|image|untitled|screenshot|snap)[_\-\d]+/i);
    const hasFolderStructure = publicId.includes("/");
    const hasHyphens = publicId.includes("-");
    
    if (isSEOFriendly && hasFolderStructure && hasHyphens) {
      return {
        status: "good",
        message: "Cloudinary public_id is SEO-friendly with folder structure",
        score: 10,
      };
    } else if (isSEOFriendly && hasHyphens) {
      return {
        status: "warning",
        message: "Cloudinary public_id is SEO-friendly but missing folder structure",
        score: 9,
      };
    } else {
      return {
        status: "warning",
        message: "Cloudinary public_id appears generic - use SEO-friendly names",
        score: 7,
      };
    }
  }
  return {
    status: "info",
    message: "Cloudinary public_id not set - using default URL",
    score: 0,
  };
};

function generateImageObjectStructuredData(data: Record<string, unknown>): Record<string, unknown> {
  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
  };

  if (data.url) structuredData.contentUrl = data.url as string;
  if (data.altText) structuredData.alternateName = data.altText as string;
  if (data.title) structuredData.name = data.title as string;
  if (data.description) structuredData.description = data.description as string;
  if (data.width && data.height) {
    structuredData.width = data.width as number;
    structuredData.height = data.height as number;
  }
  if (data.encodingFormat) structuredData.encodingFormat = data.encodingFormat as string;
  if (data.copyrightHolder) structuredData.copyrightHolder = data.copyrightHolder as string;
  if (data.creator) structuredData.creator = data.creator as string;
  if (data.dateCreated) {
    const dateValue = data.dateCreated;
    structuredData.dateCreated = typeof dateValue === "string" 
      ? dateValue.split("T")[0] 
      : (dateValue instanceof Date ? dateValue.toISOString().split("T")[0] : undefined);
  }
  // Note: Schema.org ImageObject does NOT have a standard "keywords" property.
  // Keywords should be naturally incorporated into description, name, and alternateName.
  // Meta keywords tag is deprecated by Google and not used for ranking.

  return structuredData;
}

export const mediaSEOConfig: SEODoctorConfig = {
  entityType: "ImageObject",
  maxScore: 85, // Alt Text (25) + Title (15) + Description (15) + Dimensions (10) + Filename (10) + Cloudinary (10) = 85
  generateStructuredData: generateImageObjectStructuredData,
  fields: [
    { name: "altText", label: "Alt Text", validator: validateAltText },
    { name: "title", label: "Title", validator: validateTitle },
    { name: "description", label: "Description", validator: validateDescription },
    { name: "width", label: "Dimensions", validator: validateDimensions },
    { name: "filename", label: "Filename", validator: validateFilename },
    { name: "cloudinaryPublicId", label: "Cloudinary Public ID", validator: validateCloudinaryPublicId },
    // Keywords removed from SEO scoring - they should be naturally in alt text, title, description
    // { name: "keywords", label: "Keywords", validator: validateKeywords },
  ],
};
