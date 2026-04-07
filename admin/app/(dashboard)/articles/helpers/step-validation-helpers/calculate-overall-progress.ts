import type { ArticleFormData } from "@/lib/types/form-types";
import { STEP_CONFIGS } from "./step-configs";
import { calculateStepValidation } from "./calculate-step-validation";

export function calculateOverallProgress(
  formData: ArticleFormData,
  errors: Record<string, string[]>,
  seoScore?: number,
): number {
  const validations = STEP_CONFIGS.map((step) => {
    const validation = calculateStepValidation(step.number, formData, errors);
    // Use SEO analyzer score for the SEO step (matches sidebar display)
    if (step.id === "seo" && seoScore !== undefined) {
      return { ...validation, completionPercentage: seoScore };
    }
    return validation;
  });

  const totalCompletion = validations.reduce((sum, v) => sum + v.completionPercentage, 0);
  return Math.round(totalCompletion / validations.length);
}
