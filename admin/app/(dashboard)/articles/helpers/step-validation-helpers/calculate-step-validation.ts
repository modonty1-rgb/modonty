import type { ArticleFormData } from "@/lib/types/form-types";
import type { StepValidation } from "./types";
import { STEP_CONFIGS } from "./step-configs";
import { isFieldCompleted } from "./is-field-completed";

export function calculateStepValidation(
  stepNumber: number,
  formData: ArticleFormData,
  errors: Record<string, string[]>,
): StepValidation {
  const stepConfig = STEP_CONFIGS.find((s) => s.number === stepNumber);

  if (!stepConfig) {
    return {
      stepNumber,
      completedFields: 0,
      totalFields: 0,
      requiredFields: 0,
      completedRequiredFields: 0,
      hasErrors: false,
      errors: [],
      completionPercentage: 0,
      isValid: false,
    };
  }

  const allFields = [...stepConfig.requiredFields, ...stepConfig.optionalFields];
  const totalFields = allFields.length;

  const completedRequiredFields = stepConfig.requiredFields.filter((field) => {
    if (field === "authorId") {
      return !!formData[field];
    }
    return isFieldCompleted(formData[field]);
  }).length;

  const completedOptionalFields = stepConfig.optionalFields.filter((field) =>
    isFieldCompleted(formData[field]),
  ).length;

  const completedFields = completedRequiredFields + completedOptionalFields;

  const stepErrors = Object.entries(errors)
    .filter(([field]) => allFields.includes(field as keyof ArticleFormData))
    .flatMap(([, fieldErrors]) => fieldErrors);

  const hasErrors = stepErrors.length > 0;
  const isValid = completedRequiredFields === stepConfig.requiredFields.length && !hasErrors;

  const completionPercentage =
    totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 100;

  return {
    stepNumber,
    completedFields,
    totalFields,
    requiredFields: stepConfig.requiredFields.length,
    completedRequiredFields,
    hasErrors,
    errors: stepErrors,
    completionPercentage,
    isValid,
  };
}
