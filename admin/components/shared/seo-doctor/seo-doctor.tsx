"use client";

export interface SEOFieldValidator {
  (value: unknown, data: Record<string, unknown>): {
    status: "good" | "warning" | "error" | "info";
    message: string;
    score: number;
  };
}

export interface SEOFieldConfig {
  name: string;
  label: string;
  validator: SEOFieldValidator;
}

export interface SEODoctorConfig {
  entityType: string;
  fields: SEOFieldConfig[];
  maxScore: number;
  generateStructuredData: (data: Record<string, unknown>) => Record<string, unknown>;
}
