/**
 * Types for SEO intake questionnaire.
 */

export interface IntakeQuestion {
  id: string;
  text: string;
  placeholder: string;
  help?: string;
}

export interface IntakeSection {
  id: string;
  title: string;
  questions: IntakeQuestion[];
}

export interface IntakeChecklistItem {
  id: string;
  text: string;
  placeholder: string;
}

export type IntakeFieldType = "textarea" | "input" | "select" | "multiselect" | "checklist" | "radio";

export interface IntakeFieldOption {
  value: string;
  label: string;
}

export interface IntakeFieldConfig {
  type: IntakeFieldType;
  options?: IntakeFieldOption[];
  allowOther?: boolean;
}
