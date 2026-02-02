import { SEODoctorConfig } from "@/components/shared/seo-doctor";

export interface SEOScoreResult {
  score: number;
  maxScore: number;
  percentage: number;
}

/**
 * Calculate SEO score from entity data and SEO configuration
 * @param data - Entity data object
 * @param config - SEO configuration with validators
 * @returns SEO score result with score, maxScore, and percentage
 */
export function calculateSEOScore(
  data: Record<string, any>,
  config: SEODoctorConfig
): SEOScoreResult {
  let totalScore = 0;
  const seenFields = new Set<string>(); // Track processed fields to avoid duplicates
  const validatorResults: Array<{ status: "good" | "warning" | "error" | "info" }> = [];

  for (const fieldConfig of config.fields) {
    // Skip duplicate field validations (use first occurrence only)
    if (seenFields.has(fieldConfig.name)) {
      continue;
    }
    seenFields.add(fieldConfig.name);
    
    const value = data[fieldConfig.name];
    const result = fieldConfig.validator(value, data);
    totalScore += result.score;
    validatorResults.push({ status: result.status });
  }

  const percentage = Math.round((totalScore / config.maxScore) * 100);

  // Cap at 99% if any warnings or errors exist
  const hasWarningsOrErrors = validatorResults.some(result => 
    result.status === "warning" || result.status === "error"
  );

  return {
    score: totalScore,
    maxScore: config.maxScore,
    percentage: hasWarningsOrErrors ? Math.min(99, Math.max(0, percentage)) : Math.min(100, Math.max(0, percentage)),
  };
}
