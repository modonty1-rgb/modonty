/**
 * Shared types for the Site Health Dashboard.
 * No DB persistence — all checks are on-demand and ephemeral.
 */

export type CheckStatus = "pass" | "warn" | "fail" | "skip";

export interface HealthCheckResult<T = unknown> {
  metric: string;
  status: CheckStatus;
  value?: T;
  message?: string;
  recommendation?: string;
  /** Time the check took (ms) */
  durationMs?: number;
}

export type HealthCategory =
  | "security"
  | "performance"
  | "seo"
  | "dns"
  | "uptime";

export interface CategoryReport {
  category: HealthCategory;
  score: number; // 0-100 within category
  passed: number;
  total: number;
  checks: HealthCheckResult[];
}

export interface OverallHealthReport {
  url: string;
  generatedAt: string; // ISO
  totalScore: number; // 0-100
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  categories: CategoryReport[];
}
