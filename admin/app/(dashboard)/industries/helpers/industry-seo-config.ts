import { SEODoctorConfig, SEOFieldValidator } from "@/components/shared/seo-doctor";
import {
  validateSlug,
  createValidateSEOTitle,
  createValidateSEODescription,
  validateCanonicalUrl,
} from "@/components/shared/seo-doctor/validators";
import type { SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

// Industry-specific validators
const validateIndustryName: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length > 0) {
    return {
      status: "good",
      message: "Industry name is set",
      score: 5,
    };
  }
  return {
    status: "error",
    message: "Industry name is required",
    score: 0,
  };
};

const validateIndustryDescription: SEOFieldValidator = (value) => {
  if (value && typeof value === "string" && value.trim().length >= 100) {
    return {
      status: "good",
      message: `Comprehensive industry description (${value.length} chars)`,
      score: 10,
    };
  } else if (value && typeof value === "string" && value.trim().length > 0) {
    return {
      status: "warning",
      message: `Industry description too short (${value.length} chars) - minimum 100 chars recommended`,
      score: 5,
    };
  }
  return {
    status: "warning",
    message: "Industry description recommended (minimum 100 chars) for SEO",
    score: 0,
  };
};

// Industry SEO title validator (no OG/Twitter coupling)
const createValidateIndustrySEOTitle = (settings?: SEOSettings): SEOFieldValidator => {
  const seoTitleValidator = createValidateSEOTitle(settings);
  return (value, data) => seoTitleValidator(value, data);
};

// Generate Industry structured data
function generateIndustryStructuredData(data: Record<string, unknown>): Record<string, unknown> {
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

// Industry SEO Configuration
export const createIndustrySEOConfig = (settings?: SEOSettings): SEODoctorConfig => ({
  entityType: "Industry",
  maxScore: 100,
  generateStructuredData: generateIndustryStructuredData,
  fields: [
    { name: "name", label: "Industry Name", validator: validateIndustryName },
    { name: "slug", label: "Slug", validator: validateSlug },
    { name: "description", label: "Industry Description", validator: validateIndustryDescription },
    { name: "seoTitle", label: "SEO Title", validator: createValidateIndustrySEOTitle(settings) },
    { name: "seoDescription", label: "SEO Description", validator: createValidateSEODescription(settings) },
    { name: "canonicalUrl", label: "Canonical URL", validator: validateCanonicalUrl },
  ],
});

// Backward compatibility - default config without settings
export const industrySEOConfig: SEODoctorConfig = createIndustrySEOConfig();
