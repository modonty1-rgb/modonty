import type { ArticleFormData } from "@/lib/types/form-types";

export interface CategoryScore {
  score: number;
  maxScore: number;
  percentage: number;
  passed: number;
  total: number;
}

export interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  status: "pass" | "warning" | "fail" | "info";
  currentValue?: string | number;
  targetValue?: string | number;
  recommendation: string;
  field?: keyof ArticleFormData;
  priority: "critical" | "high" | "medium" | "low";
  officialSource?: string;
}

export interface OffPageRecommendation {
  id: string;
  category: "link-building" | "social-signals" | "content-distribution" | "authority-building";
  title: string;
  description: string;
  actionable: boolean;
  steps: string[];
  priority: "high" | "medium" | "low";
}

export interface Issue {
  code: string;
  category: string;
  message: string;
  fix?: string;
  field?: keyof ArticleFormData;
  severity: "critical" | "warning" | "suggestion";
}

export interface SEOGuidanceResult {
  overallScore: number;
  categories: {
    metaTags: CategoryScore;
    content: CategoryScore;
    images: CategoryScore;
    structuredData: CategoryScore;
    technical: CategoryScore;
    mobile: CategoryScore;
  };
  inPageChecklist: ChecklistItem[];
  offPageGuidance: OffPageRecommendation[];
  criticalIssues: Issue[];
  warnings: Issue[];
  suggestions: Issue[];
  lastUpdated: string;
}

