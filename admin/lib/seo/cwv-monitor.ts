

interface CWVThresholds {
  lcp: { good: number; needsImprovement: number };
  cls: { good: number; needsImprovement: number };
  inp: { good: number; needsImprovement: number };
  ttfb: { good: number; needsImprovement: number };
}

// Google's 2025/2026 thresholds
const CWV_THRESHOLDS: CWVThresholds = {
  lcp: { good: 2500, needsImprovement: 4000 }, // ms
  cls: { good: 0.1, needsImprovement: 0.25 },
  inp: { good: 200, needsImprovement: 500 }, // ms
  ttfb: { good: 800, needsImprovement: 1800 }, // ms
};

interface JsonLdPerformanceAssessment {
  sizeBytes: number;
  sizeKB: number;
  estimatedParseTimeMs: number;
  impact: "none" | "minimal" | "moderate" | "significant";
  recommendations: string[];
}

interface PlacementRecommendation {
  placement: "head" | "body-start" | "body-end";
  reason: string;
  priority: "high" | "medium" | "low";
}

// Performance budgets (size/parse-focused)
const MAX_SIZE_BYTES = 50000; // 50KB max recommended
const WARNING_SIZE_BYTES = 30000; // 30KB warning threshold
const MAX_PARSE_TIME_MS = 50;

/**
 * Assess JSON-LD performance impact
 */
function assessJsonLdPerformanceImpact(
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

  return {
    sizeBytes,
    sizeKB,
    estimatedParseTimeMs,
    impact,
    recommendations,
  };
}
