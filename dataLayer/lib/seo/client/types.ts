// Shared SEO-score types — the contract every entity scorer (client now, article
// later) returns, so all surfaces render scores the same way. Keep this generic:
// it must NOT depend on any app (@/...) — only plain types.

export type SeoCheckStatus = "good" | "warning" | "error";

export interface SeoCheck {
  /** Stable key (e.g. "title", "ogImage", "jsonld.valid"). */
  key: string;
  /** Human label (Arabic) shown to the user. */
  label: string;
  status: SeoCheckStatus;
  /** Short why/fix hint (Arabic), shown on warning/error. */
  hint?: string;
  /** Points earned vs possible for this check (for transparency). */
  earned: number;
  max: number;
}

export interface SeoScore {
  /** 0–100, rounded. */
  score: number;
  checks: SeoCheck[];
}

/** A full entity SEO breakdown: two independent validity scores + an overall. */
export interface EntitySeoScore {
  meta: SeoScore;
  jsonLd: SeoScore;
  /** Overall = weighted average (meta + jsonLd) / 2, rounded. */
  overall: number;
}

/** Shape of the stored JSON-LD validation report (Adobe + Ajv + custom rules). */
export interface JsonLdValidationReport {
  adobe?: { valid?: boolean; errors?: unknown[]; warnings?: unknown[] } | null;
  ajv?: { valid?: boolean; errors?: unknown[]; warnings?: unknown[] } | null;
  custom?: { valid?: boolean; errors?: unknown[]; warnings?: unknown[] } | null;
}

/** Count total hard errors across all validators in a report. */
export function countReportErrors(report: JsonLdValidationReport | null | undefined): number {
  if (!report) return 0;
  const len = (e: unknown) => (Array.isArray(e) ? e.length : 0);
  return len(report.adobe?.errors) + len(report.ajv?.errors) + len(report.custom?.errors);
}

/** Count total warnings across all validators in a report. */
export function countReportWarnings(report: JsonLdValidationReport | null | undefined): number {
  if (!report) return 0;
  const len = (w: unknown) => (Array.isArray(w) ? w.length : 0);
  return len(report.adobe?.warnings) + len(report.ajv?.warnings) + len(report.custom?.warnings);
}
