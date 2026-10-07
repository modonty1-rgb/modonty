/**
 * SEO Utilities - Main Export
 *
 * Complete SEO toolkit for Modonty platform.
 * Phases 1-15 implementation.
 */

// ============================================
// Phase 2: Knowledge Graph Generator
// ============================================
export {  } from "./knowledge-graph-generator";

// ============================================
// Phase 3: JSON-LD Validator
// ============================================
export {  } from "./jsonld-validator";


// ============================================
// Phase 4: JSON-LD Storage
// ============================================
export { generateAndSaveJsonLd, getJsonLdStats } from "./jsonld-storage";

// Rebuilds BOTH stored blobs (JSON-LD + Next.js metadata) for a set of articles. Reach for
// this whenever a renamed entity cascades onto its articles — `batchRegenerateJsonLd` above
// rebuilds only half the published surface and leaves the Open Graph tags on the old name.
export { batchRegenerateArticleSeo } from "./batch-regenerate-article-seo";

// (Removed 2026-07-14: "Phase 9 AI Crawler Optimization" re-exports — ai-crawler-optimizer
// had ZERO call sites anywhere (GEO audit, بند ٩); the file is deleted with them.)


// ============================================
// Phase 10: Auto-Fix Engine
// ============================================
export {  } from "./auto-fix";

// ============================================
// Phase 10: Pre-Publish Audit
// ============================================
export {  } from "./pre-publish-audit";

// ============================================
// Phase 11: Entity Disambiguator (Wikidata)
// ============================================
export {  } from "./entity-disambiguator";


// ============================================
// Phase 12: Core Web Vitals Monitor
// ============================================
export {  } from "./cwv-monitor";

// ============================================
// Phase 13: International SEO
// ============================================
export {  } from "./international-seo";

// (Removed 2026-07-14: "Phase 15 Sitemap & Robots.txt" re-exports — generateRobotsTxt and
// friends had ZERO call sites, and that robots output would CONFLICT with the live
// modonty/app/robots.ts policy if ever wired up (GEO audit, بند ٩). File deleted with them.)

// ============================================
// Phase 14: Search Console API (SERVER-ONLY)
// ============================================
// NOTE: Search Console API functions are NOT exported here to prevent client-side bundling
// Import them directly from "./search-console-api" in server components/actions only
// Example: import { isSearchConsoleConfigured } from "@/lib/seo/search-console-api";

// ============================================
// Phase 14: Alert System
// ============================================
export { getAlertConfig } from "./alert-system";

// ============================================
// Phase 14: Weekly Report Generator (SERVER-ONLY)
// ============================================
// NOTE: Weekly Report functions are NOT exported here to prevent client-side bundling
// Import them directly from "./weekly-report-generator" in server components/actions only
// Example: import { generateWeeklyReport } from "@/lib/seo/weekly-report-generator";

// ============================================
// Legacy (Backward Compatibility)
// ============================================

// ============================================
// Metadata Generation (for Preview Pages)
// ============================================
