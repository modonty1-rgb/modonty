import type { ArticleFormData } from "@/lib/types/form-types";
import { STEP_CONFIGS } from "./step-configs";
import { isFieldCompleted } from "./is-field-completed";
import { FIELD_LABELS } from "./field-labels";

export function getMissingRequiredFields(
  stepNumber: number,
  formData: ArticleFormData,
): Array<{ field: string; label: string }> {
  const stepConfig = STEP_CONFIGS.find((s) => s.number === stepNumber);
  if (!stepConfig) return [];

  return stepConfig.requiredFields
    .filter((field) =>
      field === "authorId"
        ? !formData[field]
        : !isFieldCompleted(formData[field]),
    )
    .map((field) => ({
      field,
      label: FIELD_LABELS[field] || field,
    }));
}

export function getMissingOptionalFields(
  stepNumber: number,
  formData: ArticleFormData,
): Array<{ field: string; label: string }> {
  const stepConfig = STEP_CONFIGS.find((s) => s.number === stepNumber);
  if (!stepConfig) return [];

  return stepConfig.optionalFields
    .filter((field) => !isFieldCompleted(formData[field]))
    .map((field) => ({
      field,
      label: FIELD_LABELS[field] || field,
    }));
}
