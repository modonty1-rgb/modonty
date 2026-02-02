import type { ArticleFormData } from "@/lib/types/form-types";

export interface StepConfig {
  number: number;
  label: string;
  id: string;
  description: string;
  requiredFields: (keyof ArticleFormData)[];
  optionalFields: (keyof ArticleFormData)[];
}

export interface StepValidation {
  stepNumber: number;
  completedFields: number;
  totalFields: number;
  requiredFields: number;
  completedRequiredFields: number;
  hasErrors: boolean;
  errors: string[];
  completionPercentage: number;
  isValid: boolean;
}
