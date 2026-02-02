import { SEODoctorConfig, SEOFieldValidator } from "@/components/shared/seo-doctor";
import {
  validateSlug,
  createValidateSEOTitle,
  createValidateSEODescription,
  validateCanonicalUrl,
} from "@/components/shared/seo-doctor/validators";
import type { SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

// Tag-specific validators
const validateTagName: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    return {
      status: "good",
      message: "Tag name is set",
      score: 5,
    };
  }
  return {
    status: "error",
    message: "Tag name is required",
    score: 0,
  };
};

const validateTagDescription: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length >= 100) {
    return {
      status: "good",
      message: `Comprehensive tag description (${value.length} chars)`,
      score: 10,
    };
  } else if (value && typeof value === "string" && value.trim().length > 0) {
    return {
      status: "warning",
      message: `Tag description too short (${value.length} chars) - minimum 100 chars recommended`,
      score: 5,
    };
  }
  return {
    status: "warning",
    message: "Tag description recommended (minimum 100 chars) for SEO",
    score: 0,
  };
};

// Tag SEO title validator (simplified - no OG/Twitter coupling)
const createValidateTagSEOTitle = (settings?: SEOSettings): SEOFieldValidator => {
  const seoTitleValidator = createValidateSEOTitle(settings);
  return (value, data) => seoTitleValidator(value, data);
};

// Generate Tag structured data
function generateTagStructuredData(data: Record<string, unknown>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: (data.name as string) || "",
    description: (data.description as string) || undefined,
    url: data.canonicalUrl ? (data.canonicalUrl as string) : undefined,
    about: {
      "@type": "DefinedTerm",
      name: (data.name as string) || "",
      description: (data.description as string) || undefined,
    },
  };
}

// Tag SEO Configuration
export const createTagSEOConfig = (settings?: SEOSettings): SEODoctorConfig => ({
  entityType: "Tag",
  maxScore: 100,
  generateStructuredData: generateTagStructuredData,
  fields: [
    { name: "name", label: "Tag Name", validator: validateTagName },
    { name: "slug", label: "Slug", validator: validateSlug },
    { name: "description", label: "Tag Description", validator: validateTagDescription },
    { name: "seoTitle", label: "SEO Title", validator: createValidateTagSEOTitle(settings) },
    { name: "seoDescription", label: "SEO Description", validator: createValidateSEODescription(settings) },
    { name: "canonicalUrl", label: "Canonical URL", validator: validateCanonicalUrl },
  ],
});

// Backward compatibility - default config without settings
export const tagSEOConfig: SEODoctorConfig = createTagSEOConfig();
