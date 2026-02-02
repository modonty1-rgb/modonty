import type { StepValidation } from "./types";

export function getStepStatus(
  stepNumber: number,
  currentStep: number,
  validation: StepValidation,
): "active" | "completed" | "error" | "warning" | "pending" {
  if (stepNumber === currentStep) {
    return "active";
  }

  if (stepNumber < currentStep) {
    if (validation.hasErrors) {
      return "error";
    }
    if (validation.completedRequiredFields < validation.requiredFields) {
      return "warning";
    }
    return "completed";
  }

  return "pending";
}
