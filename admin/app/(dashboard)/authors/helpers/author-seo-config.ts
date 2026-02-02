import { SEODoctorConfig, SEOFieldValidator } from "@/components/shared/seo-doctor";
import {
  validateSlug,
  createValidateSEOTitle,
  createValidateSEODescription,
  validateOGImage,
  validateImageAlt,
  validateUrl,
  validateCanonicalUrl,
} from "@/components/shared/seo-doctor/validators";
import type { SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

// Author-specific validators
const validateAuthorName: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    return {
      status: "good",
      message: "Author name is set",
      score: 5,
    };
  }
  return {
    status: "error",
    message: "Author name is required",
    score: 0,
  };
};

const validateAuthorBio: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length >= 100) {
    return {
      status: "good",
      message: `Comprehensive author bio (${value.length} chars) for Schema.org Person`,
      score: 10,
    };
  } else if (value && typeof value === "string" && value.trim().length > 0) {
    return {
      status: "warning",
      message: `Author bio too short (${value.length} chars) - minimum 100 chars recommended`,
      score: 5,
    };
  }
  return {
    status: "warning",
    message: "Author bio required (minimum 100 chars) for Schema.org Person",
    score: 0,
  };
};

const validateAuthorEETAT: SEOFieldValidator = (value, data) => {
  const hasJobTitle = data.jobTitle && typeof data.jobTitle === "string" && data.jobTitle.trim().length > 0;
  const hasCredentials = Array.isArray(data.credentials) && data.credentials.length > 0;
  const hasExpertise = Array.isArray(data.expertiseAreas) && data.expertiseAreas.length > 0;
  const isVerified = data.verificationStatus === true;
  
  let score = 0;
  const signals = [];
  
  if (hasJobTitle) {
    score += 2;
    signals.push("job title");
  }
  if (hasCredentials) {
    score += 3;
    signals.push("credentials");
  }
  if (hasExpertise) {
    score += 2;
    signals.push("expertise areas");
  }
  if (isVerified) {
    score += 5;
    signals.push("verification");
  }
  
  if (signals.length >= 4) {
    return {
      status: "good",
      message: `Strong E-E-A-T signals: ${signals.join(", ")} - excellent for SEO`,
      score: Math.min(score, 15),
    };
  } else if (signals.length >= 2) {
    return {
      status: "warning",
      message: `Partial E-E-A-T signals: ${signals.join(", ")} - add more for better SEO`,
      score: Math.min(score, 10),
    };
  }
  return {
    status: "warning",
    message: "E-E-A-T signals recommended - add job title, credentials, expertise areas, verification",
    score: 0,
  };
};

const validateAuthorSocial: SEOFieldValidator = (value, data) => {
  const hasLinkedIn = data.linkedIn && typeof data.linkedIn === "string" && data.linkedIn.trim().length > 0;
  const hasTwitter = data.twitter && typeof data.twitter === "string" && data.twitter.trim().length > 0;
  const hasFacebook = data.facebook && typeof data.facebook === "string" && data.facebook.trim().length > 0;
  const sameAsArray = Array.isArray(data.sameAs) ? data.sameAs : [];
  const totalSocial = (hasLinkedIn ? 1 : 0) + (hasTwitter ? 1 : 0) + (hasFacebook ? 1 : 0) + sameAsArray.length;
  
  if (totalSocial >= 3) {
    return {
      status: "good",
      message: `Excellent! ${totalSocial} social profiles - great for Schema.org sameAs`,
      score: 10,
    };
  } else if (totalSocial >= 2) {
    return {
      status: "good",
      message: `Good! ${totalSocial} social profiles added`,
      score: 8,
    };
  } else if (totalSocial >= 1) {
    return {
      status: "warning",
      message: `Only ${totalSocial} social profile - add more for better verification`,
      score: 5,
    };
  }
  return {
    status: "warning",
    message: "Social profiles recommended for Schema.org Person sameAs property",
    score: 0,
  };
};

// Generate Person structured data
function generatePersonStructuredData(data: Record<string, unknown>): Record<string, unknown> {
  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: (data.name as string) || "",
  };

  if (data.bio) structuredData.description = data.bio as string;
  if (data.canonicalUrl) structuredData.url = data.canonicalUrl as string;
  else if (data.url) structuredData.url = data.url as string;
  if (data.image) structuredData.image = data.image as string;
  if (data.email) structuredData.email = data.email as string;
  if (data.jobTitle) structuredData.jobTitle = data.jobTitle as string;
  if (Array.isArray(data.expertiseAreas) && data.expertiseAreas.length > 0) {
    structuredData.knowsAbout = data.expertiseAreas;
  }
  if (Array.isArray(data.memberOf) && data.memberOf.length > 0) {
    structuredData.memberOf = data.memberOf.map((org: string) => ({
      "@type": "Organization",
      name: org,
    }));
  }
  if (Array.isArray(data.sameAs) && data.sameAs.length > 0) {
    structuredData.sameAs = data.sameAs;
  } else {
    const socialProfiles: string[] = [];
    if (data.linkedIn) socialProfiles.push(data.linkedIn as string);
    if (data.twitter) socialProfiles.push(data.twitter as string);
    if (data.facebook) socialProfiles.push(data.facebook as string);
    if (socialProfiles.length > 0) {
      structuredData.sameAs = socialProfiles;
    }
  }

  return structuredData;
}

// Author SEO Configuration
export const createAuthorSEOConfig = (settings?: SEOSettings): SEODoctorConfig => ({
  entityType: "Person",
  maxScore: 150,
  generateStructuredData: generatePersonStructuredData,
  fields: [
    { name: "name", label: "Author Name", validator: validateAuthorName },
    { name: "slug", label: "Slug", validator: validateSlug },
    { name: "bio", label: "Author Bio", validator: validateAuthorBio },
    { name: "image", label: "Profile Image", validator: validateOGImage },
    { name: "imageAlt", label: "Profile Image Alt Text", validator: validateImageAlt },
    { name: "canonicalUrl", label: "Canonical URL", validator: validateCanonicalUrl },
    { name: "jobTitle", label: "E-E-A-T Signals", validator: validateAuthorEETAT },
    { name: "linkedIn", label: "Social Profiles", validator: validateAuthorSocial },
    { name: "seoTitle", label: "SEO Title", validator: createValidateSEOTitle(settings) },
    { name: "seoDescription", label: "SEO Description", validator: createValidateSEODescription(settings) },
    { name: "url", label: "Author URL", validator: validateUrl },
  ],
});

// Backward compatibility - default config without settings
export const authorSEOConfig: SEODoctorConfig = createAuthorSEOConfig();
