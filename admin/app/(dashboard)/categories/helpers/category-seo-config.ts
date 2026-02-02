import { SEODoctorConfig, SEOFieldValidator } from "@/components/shared/seo-doctor";
import {
  validateSlug,
  createValidateSEOTitle,
  createValidateSEODescription,
  validateCanonicalUrl,
} from "@/components/shared/seo-doctor/validators";
import type { SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

// Category-specific validators
const validateCategoryName: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    return {
      status: "good",
      message: "Category name is set",
      score: 5,
    };
  }
  return {
    status: "error",
    message: "Category name is required",
    score: 0,
  };
};

const validateCategoryDescription: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length >= 100) {
    return {
      status: "good",
      message: `Comprehensive category description (${value.length} chars)`,
      score: 10,
    };
  } else if (value && typeof value === "string" && value.trim().length > 0) {
    return {
      status: "warning",
      message: `Category description too short (${value.length} chars) - minimum 100 chars recommended`,
      score: 5,
    };
  }
  return {
    status: "warning",
    message: "Category description required (minimum 100 chars) for SEO",
    score: 0,
  };
};

// Category SEO title validator (simplified - no OG/Twitter coupling)
const createValidateCategorySEOTitle = (settings?: SEOSettings): SEOFieldValidator => {
  const seoTitleValidator = createValidateSEOTitle(settings);
  return (value, data) => seoTitleValidator(value, data);
};

// Generate Category structured data
function generateCategoryStructuredData(data: Record<string, unknown>): Record<string, unknown> {
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

// Category SEO Configuration
export const createCategorySEOConfig = (settings?: SEOSettings): SEODoctorConfig => ({
  entityType: "Category",
  maxScore: 100,
  generateStructuredData: generateCategoryStructuredData,
  fields: [
    { name: "name", label: "Category Name", validator: validateCategoryName },
    { name: "slug", label: "Slug", validator: validateSlug },
    { name: "description", label: "Category Description", validator: validateCategoryDescription },
    { name: "seoTitle", label: "SEO Title", validator: createValidateCategorySEOTitle(settings) },
    { name: "seoDescription", label: "SEO Description", validator: createValidateSEODescription(settings) },
    { name: "canonicalUrl", label: "Canonical URL", validator: validateCanonicalUrl },
  ],
});

// Backward compatibility - default config without settings
export const categorySEOConfig: SEODoctorConfig = createCategorySEOConfig();
