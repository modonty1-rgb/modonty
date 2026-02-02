import type { ArticleFormData } from "@/lib/types/form-types";
import { STEP_CONFIGS } from "./step-configs";
import { calculateStepValidation } from "./calculate-step-validation";

export function calculateOverallProgress(
  formData: ArticleFormData,
  errors: Record<string, string[]>,
): number {
  const validations = STEP_CONFIGS.slice(0, 7).map((step) =>
    calculateStepValidation(step.number, formData, errors),
  );

  const totalCompletion = validations.reduce((sum, v) => sum + v.completionPercentage, 0);
  return Math.round(totalCompletion / validations.length);
}
