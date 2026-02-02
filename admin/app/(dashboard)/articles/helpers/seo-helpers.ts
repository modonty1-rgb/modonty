/**
 * SEO Helpers - Barrel file for backward compatibility
 * Re-exports all SEO-related utilities
 * 
 * This file maintains backward compatibility while the actual
 * implementations are split into focused modules following SOLID principles
 */

// Word counting and content analysis
export {
  calculateWordCount,
  calculateWordCountImproved,
  detectArabicText,
  calculateReadingTime,
  determineContentDepth,
} from "./word-count";

// SEO metadata generation
export {
  generateSEOTitle,
  generateSEODescription,
  generateCanonicalUrl,
} from "./seo-generation";

// SEO validation
export {
  validateSEOTitle,
  validateSEODescription,
  type ValidationResult,
} from "./seo-validation";

// Breadcrumb generation
export {
  generateBreadcrumbPath,
  type BreadcrumbItem,
} from "./breadcrumb";

// Content extraction
export { extractExcerpt } from "./content-extraction";

// Re-export slugify from utils
export { slugify } from "@/lib/utils";
