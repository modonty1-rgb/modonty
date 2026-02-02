/**
 * SEO Utilities - Main Export
 *
 * Complete SEO toolkit for Modonty platform.
 * Phases 1-15 implementation.
 */

// ============================================
// Phase 2: Knowledge Graph Generator
// ============================================
export {
  generateArticleKnowledgeGraph,
  stringifyKnowledgeGraph,
  stringifyKnowledgeGraphPretty,
  type ArticleWithFullRelations,
  type JsonLdGraph,
  type JsonLdNode,
} from "./knowledge-graph-generator";

// ============================================
// Phase 3: JSON-LD Validator
// ============================================
export {
  validateJsonLd,
  validateBusinessRules,
  validateJsonLdComplete,
  getValidationSummary,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
  type ValidationReport,
  type BusinessValidationResult,
} from "./jsonld-validator";

// ============================================
// Phase 3: Publish Policy (Client-Safe)
// ============================================
export {
  canPublishArticle,
  type PublishDecision,
} from "./publish-policy";

// ============================================
// Phase 4: JSON-LD Storage
// ============================================
export {
  fetchArticleForJsonLd,
  extractPlainText,
  generateAndSaveJsonLd,
  regenerateJsonLd,
  getCachedJsonLd,
  needsRegeneration,
  rollbackJsonLd,
  batchRegenerateJsonLd,
  getArticlesNeedingRegeneration,
  getJsonLdStats,
  type JsonLdGenerationResult,
} from "./jsonld-storage";

// ============================================
// Phase 5: JSON-LD Validation Action (Preview)
// ============================================
export {
  validateJsonLdPreview,
} from "./jsonld-validation-action";

// ============================================
// Phase 9: AI Crawler Optimization
// ============================================
export {
  extractPlainTextForAI,
  extractKeyFacts,
  generateTLDR,
  calculateReadingLevel,
  extractSignificantLinks,
  generateTopicClusters,
  generateAIOptimizedMetadata,
  enhanceJsonLdForAI,
  type AIOptimizedMetadata,
  type SemanticKeyword,
  type SignificantLink,
} from "./ai-crawler-optimizer";

// ============================================
// Phase 9: Content Quality Scoring
// ============================================
export {
  scoreArticleQuality,
  getScoreLabel,
  type QualityScore,
  type ReadabilityScore,
  type SEOScore,
  type EEATScore,
  type MediaScore,
  type Recommendation,
} from "./content-quality-scorer";

// ============================================
// Phase 10: Auto-Fix Engine
// ============================================
export {
  autoFixArticle,
  batchAutoFix,
  findArticlesNeedingFix,
  previewAutoFix,
  type AutoFixResult,
  type FixAction,
} from "./auto-fix";

// ============================================
// Phase 10: Pre-Publish Audit
// ============================================
export {
  auditBeforePublish,
  getAuditSummary,
  groupIssuesByCategory,
  type AuditResult,
  type AuditIssue,
} from "./pre-publish-audit";

// ============================================
// Phase 11: Entity Disambiguator (Wikidata)
// ============================================
export {
  searchWikidata,
  getWikidataEntity,
  findWikidataEntity,
  enrichKeywordsWithWikidata,
  extractKeywordsForEntityLinking,
  formatSemanticKeywordsForStorage,
  type WikidataEntity,
} from "./entity-disambiguator";

// ============================================
// Phase 11: Custom Validation Rules
// ============================================
export {
  CUSTOM_RULES,
  runCustomValidation,
  getFailedRules,
  customValidationPasses,
  type ValidationRule,
  type RuleContext,
  type ValidationRuleResult,
  type CustomValidationReport,
} from "./custom-validation-rules";

// ============================================
// Phase 12: Core Web Vitals Monitor
// ============================================
export {
  CWV_THRESHOLDS,
  JSONLD_PERFORMANCE_BUDGETS,
  assessJsonLdPerformanceImpact,
  getJsonLdPlacementRecommendation,
  checkStructuredDataBudget,
  optimizeJsonLdForPerformance,
  getCWVScoreLabel,
  type CWVMetrics,
  type CWVThresholds,
  type JsonLdPerformanceAssessment,
  type PlacementRecommendation,
} from "./cwv-monitor";

// ============================================
// Phase 13: International SEO
// ============================================
export {
  SUPPORTED_LANGUAGES,
  generateHreflangLinks,
  generateHreflangHTML,
  generateMultilingualJsonLd,
  isRTLLanguage,
  optimizeForArabicContent,
  validateArabicJsonLd,
  getOGLocale,
  generateInternationalSEOData,
  type HreflangLink,
  type MultilingualArticle,
  type InternationalSEOData,
} from "./international-seo";

// ============================================
// Phase 15: Sitemap & Robots.txt
// ============================================
export {
  generateArticleSitemapEntry,
  generateArticleSitemap,
  generateSitemapIndex,
  generateRobotsTxt,
  validateSitemapSize,
  type SitemapEntry,
  type SitemapImage,
  type SitemapNews,
} from "./sitemap-generator";

// ============================================
// Phase 14: Search Console API (SERVER-ONLY)
// ============================================
// NOTE: Search Console API functions are NOT exported here to prevent client-side bundling
// Import them directly from "./search-console-api" in server components/actions only
// Example: import { isSearchConsoleConfigured } from "@/lib/seo/search-console-api";

// ============================================
// Phase 14: Alert System
// ============================================
export {
  sendAlert,
  createAlertFromError,
  getAlertConfig,
  type AlertConfig,
  type Alert,
} from "./alert-system";

// ============================================
// Phase 14: Weekly Report Generator (SERVER-ONLY)
// ============================================
// NOTE: Weekly Report functions are NOT exported here to prevent client-side bundling
// Import them directly from "./weekly-report-generator" in server components/actions only
// Example: import { generateWeeklyReport } from "@/lib/seo/weekly-report-generator";

// ============================================
// Legacy (Backward Compatibility)
// ============================================
export {
  generateArticleStructuredData,
  generateBreadcrumbStructuredData,
  generateAuthorStructuredData,
  generateOrganizationStructuredData,
  generateFAQPageStructuredData,
} from "./structured-data";

// ============================================
// Metadata Generation (for Preview Pages)
// ============================================
export { generateMetadataFromSEO, type SEOData, type SEOOptions } from "./seo-metadata";
