/**
 * Core Web Vitals Monitor - Phase 12
 *
 * Monitors and optimizes JSON-LD for Core Web Vitals:
 * - JSON-LD size impact on LCP
 * - Placement recommendations
 * - Performance budgets
 */

export interface CWVMetrics {
  lcp: number; // Largest Contentful Paint (ms)
  cls: number; // Cumulative Layout Shift
  inp: number; // Interaction to Next Paint (ms)
  ttfb: number; // Time to First Byte (ms)
  fcp: number; // First Contentful Paint (ms)
}

export interface CWVThresholds {
  lcp: { good: number; needsImprovement: number };
  cls: { good: number; needsImprovement: number };
  inp: { good: number; needsImprovement: number };
  ttfb: { good: number; needsImprovement: number };
}

// Google's 2025/2026 thresholds
export const CWV_THRESHOLDS: CWVThresholds = {
  lcp: { good: 2500, needsImprovement: 4000 }, // ms
  cls: { good: 0.1, needsImprovement: 0.25 },
  inp: { good: 200, needsImprovement: 500 }, // ms
  ttfb: { good: 800, needsImprovement: 1800 }, // ms
};

export interface JsonLdPerformanceAssessment {
  sizeBytes: number;
  sizeKB: number;
  estimatedParseTimeMs: number;
  impact: "none" | "minimal" | "moderate" | "significant";
  recommendations: string[];
}

export interface PlacementRecommendation {
  placement: "head" | "body-start" | "body-end";
  reason: string;
  priority: "high" | "medium" | "low";
}

// Performance budgets (size/parse-focused)
const MAX_SIZE_BYTES = 50000; // 50KB max recommended
const WARNING_SIZE_BYTES = 30000; // 30KB warning threshold
const MAX_PARSE_TIME_MS = 50; // 50ms max parse time

export const JSONLD_PERFORMANCE_BUDGETS = {
  MAX_SIZE_BYTES,
  WARNING_SIZE_BYTES,
  MAX_PARSE_TIME_MS,
} as const;

/**
 * Assess JSON-LD performance impact
 */
export function assessJsonLdPerformanceImpact(
  jsonLd: object | string
): JsonLdPerformanceAssessment {
  const jsonString = typeof jsonLd === "string" ? jsonLd : JSON.stringify(jsonLd);
  const sizeBytes = new TextEncoder().encode(jsonString).length;
  const sizeKB = Math.round((sizeBytes / 1024) * 100) / 100;

  // Estimate parse time (rough: ~1ms per 10KB for modern browsers)
  const estimatedParseTimeMs = Math.round(sizeBytes / 10000);

  const recommendations: string[] = [];

  // Determine impact level
  let impact: JsonLdPerformanceAssessment["impact"] = "none";

  if (sizeBytes > MAX_SIZE_BYTES) {
    impact = "significant";
    recommendations.push(
      `JSON-LD كبير جداً (${sizeKB}KB). قلل الحجم إلى أقل من 50KB`
    );
  } else if (sizeBytes > WARNING_SIZE_BYTES) {
    impact = "moderate";
    recommendations.push(
      `حجم JSON-LD (${sizeKB}KB) قد يؤثر على الأداء. حاول تقليله`
    );
  } else if (sizeBytes > 10000) {
    impact = "minimal";
  }

  // Size-specific recommendations
  if (sizeBytes > 20000) {
    recommendations.push("ضع JSON-LD في نهاية <body> لتحسين LCP");
    recommendations.push("استخدم defer أو async للتحميل غير المتزامن");
  }

  // Check for potential optimizations
  if (jsonString.includes("articleBody") && jsonString.length > 30000) {
    recommendations.push("قلل طول articleBody أو أزله من JSON-LD");
  }

  return {
    sizeBytes,
    sizeKB,
    estimatedParseTimeMs,
    impact,
    recommendations,
  };
}

/**
 * Get JSON-LD placement recommendation
 */
export function getJsonLdPlacementRecommendation(
  sizeBytes: number,
  priority: "seo" | "performance" = "seo"
): PlacementRecommendation {
  // Small JSON-LD: head is fine
  if (sizeBytes < 5000) {
    return {
      placement: "head",
      reason: "JSON-LD صغير (<5KB) ولن يؤثر على الأداء",
      priority: "low",
    };
  }

  // Medium JSON-LD: depends on priority
  if (sizeBytes < 20000) {
    if (priority === "seo") {
      return {
        placement: "head",
        reason: "Google يفضل JSON-LD في <head> للفهرسة السريعة",
        priority: "medium",
      };
    }
    return {
      placement: "body-start",
      reason: "وضعه بعد المحتوى الرئيسي لتحسين LCP",
      priority: "medium",
    };
  }

  // Large JSON-LD: body-end recommended
  return {
    placement: "body-end",
    reason: "JSON-LD كبير (>20KB). ضعه في نهاية الصفحة لتحسين LCP",
    priority: "high",
  };
}

/**
 * Check if structured data meets performance budget
 */
export function checkStructuredDataBudget(
  jsonLd: object | string
): {
  passed: boolean;
  issues: string[];
  metrics: {
    sizeKB: number;
    parseTimeMs: number;
  };
} {
  const assessment = assessJsonLdPerformanceImpact(jsonLd);
  const issues: string[] = [];

  // Size check
  if (assessment.sizeBytes > MAX_SIZE_BYTES) {
    issues.push(`حجم JSON-LD (${assessment.sizeKB}KB) يتجاوز الحد (50KB)`);
  }

  // Parse time check
  if (assessment.estimatedParseTimeMs > MAX_PARSE_TIME_MS) {
    issues.push(
      `وقت التحليل المتوقع (${assessment.estimatedParseTimeMs}ms) قد يؤثر على INP`
    );
  }

  return {
    passed: issues.length === 0,
    issues,
    metrics: {
      sizeKB: assessment.sizeKB,
      parseTimeMs: assessment.estimatedParseTimeMs,
    },
  };
}

/**
 * Generate optimized JSON-LD (remove heavy fields)
 */
export function optimizeJsonLdForPerformance(
  jsonLd: object,
  options?: {
    removeArticleBody?: boolean;
    truncateDescriptions?: number;
    removeOptionalFields?: boolean;
  }
): object {
  const opts = {
    removeArticleBody: true,
    truncateDescriptions: 200,
    removeOptionalFields: false,
    ...options,
  };

  const optimized = JSON.parse(JSON.stringify(jsonLd));
  const graph = optimized["@graph"];

  if (!Array.isArray(graph)) return optimized;

  for (const node of graph) {
    // Remove articleBody (heavy)
    if (opts.removeArticleBody && node.articleBody) {
      delete node.articleBody;
    }

    // Truncate descriptions
    if (opts.truncateDescriptions) {
      if (node.description && node.description.length > opts.truncateDescriptions) {
        node.description = node.description.slice(0, opts.truncateDescriptions) + "...";
      }
      if (node.abstract && node.abstract.length > opts.truncateDescriptions) {
        node.abstract = node.abstract.slice(0, opts.truncateDescriptions) + "...";
      }
    }

    // Remove optional fields
    if (opts.removeOptionalFields) {
      const optionalFields = [
        "educationalLevel",
        "accessMode",
        "accessibilitySummary",
        "mentions",
        "significantLink",
      ];
      for (const field of optionalFields) {
        if (node[field]) delete node[field];
      }
    }
  }

  return optimized;
}

/**
 * Get CWV score label
 */
export function getCWVScoreLabel(
  metric: keyof CWVThresholds,
  value: number
): "good" | "needs-improvement" | "poor" {
  const thresholds = CWV_THRESHOLDS[metric];

  if (value <= thresholds.good) return "good";
  if (value <= thresholds.needsImprovement) return "needs-improvement";
  return "poor";
}
