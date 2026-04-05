import { SEODoctorConfig, SEOFieldValidator } from "@/components/shared/seo-doctor";
import {
  validateSlug,
  createValidateSEOTitle,
  createValidateSEODescription,
  validateImageAlt,
  validateCanonicalUrl,
} from "@/components/shared/seo-doctor/validators";
import type { SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

const validateAuthorName: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    return { status: "good", message: "Author name is set", score: 10 };
  }
  return { status: "error", message: "Author name is required", score: 0 };
};

const validateAuthorBio: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length >= 100) {
    return { status: "good", message: `Bio is ${value.length} chars — good length`, score: 15 };
  } else if (value && typeof value === "string" && value.trim().length > 0) {
    return { status: "warning", message: `Bio is ${value.length} chars — 100+ recommended`, score: 8 };
  }
  return { status: "error", message: "Bio is required — 100+ chars recommended", score: 0 };
};

const validateAuthorImage: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    return { status: "good", message: "Profile image is set", score: 15 };
  }
  return { status: "error", message: "Profile image is required — shown on articles and Google", score: 0 };
};

const validateJobTitle: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    return { status: "good", message: "Job title is set", score: 10 };
  }
  return { status: "warning", message: "Add a job title (e.g., Content Platform)", score: 0 };
};

const validateAuthorSocial: SEOFieldValidator = (value, data) => {
  const hasLinkedIn = data.linkedIn && typeof data.linkedIn === "string" && data.linkedIn.trim().length > 0;
  const hasTwitter = data.twitter && typeof data.twitter === "string" && data.twitter.trim().length > 0;
  const hasFacebook = data.facebook && typeof data.facebook === "string" && data.facebook.trim().length > 0;
  const totalSocial = (hasLinkedIn ? 1 : 0) + (hasTwitter ? 1 : 0) + (hasFacebook ? 1 : 0);

  if (totalSocial >= 2) {
    return { status: "good", message: `${totalSocial} social profiles linked`, score: 10 };
  } else if (totalSocial === 1) {
    return { status: "warning", message: "Only 1 social profile — add more for better trust", score: 5 };
  }
  return { status: "warning", message: "Add social profiles (LinkedIn, X, Facebook)", score: 0 };
};

function generatePersonStructuredData(data: Record<string, unknown>): Record<string, unknown> {
  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: (data.name as string) || "",
  };

  if (data.firstName) structuredData.givenName = data.firstName as string;
  if (data.lastName) structuredData.familyName = data.lastName as string;
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
  const socialProfiles: string[] = [];
  if (data.linkedIn) socialProfiles.push(data.linkedIn as string);
  if (data.twitter) socialProfiles.push(data.twitter as string);
  if (data.facebook) socialProfiles.push(data.facebook as string);
  if (Array.isArray(data.sameAs)) socialProfiles.push(...data.sameAs.filter(Boolean) as string[]);
  if (socialProfiles.length > 0) structuredData.sameAs = socialProfiles;

  return structuredData;
}

export const createAuthorSEOConfig = (settings?: SEOSettings): SEODoctorConfig => ({
  entityType: "Person",
  maxScore: 100,
  generateStructuredData: generatePersonStructuredData,
  fields: [
    { name: "name", label: "Author Name", validator: validateAuthorName },
    { name: "slug", label: "Slug", validator: validateSlug },
    { name: "bio", label: "Bio", validator: validateAuthorBio },
    { name: "image", label: "Profile Image", validator: validateAuthorImage },
    { name: "imageAlt", label: "Image Alt Text", validator: validateImageAlt },
    { name: "jobTitle", label: "Job Title", validator: validateJobTitle },
    { name: "linkedIn", label: "Social Profiles", validator: validateAuthorSocial },
    { name: "seoTitle", label: "SEO Title", validator: createValidateSEOTitle(settings) },
    { name: "seoDescription", label: "SEO Description", validator: createValidateSEODescription(settings) },
    { name: "canonicalUrl", label: "Canonical URL", validator: validateCanonicalUrl },
  ],
});

export const authorSEOConfig: SEODoctorConfig = createAuthorSEOConfig();
