/**
 * Client classification — SINGLE SOURCE OF TRUTH.
 *
 * Canonical option lists for `Client.legalForm` + `Client.organizationType`, shared by
 * admin (zod + dropdowns), console (dropdowns + save-time normalization), and the DB
 * maintenance sanitizer. The DB columns stay `String?` — these constants are the
 * contract, and `normalize*()` guards every write so only canonical values are stored.
 *
 * To add/rename an option: edit ONLY this file. No DB migration, no `prisma generate`.
 */

export interface ClassificationOption {
  /** Canonical value stored in the DB + emitted to schema.org. */
  value: string;
  /** Arabic label shown in the UI. */
  ar: string;
  /** Patterns matching legacy / free-text input (Arabic or loose) → mapped to `value`. */
  patterns?: readonly RegExp[];
}

// ─── Legal forms (Saudi / Gulf entity types) ─────────────────────────────────
export const LEGAL_FORMS = [
  { value: "LLC", ar: "شركة ذات مسؤولية محدودة (ذ.م.م)", patterns: [/ذات\s*مسؤولية\s*محدودة/i, /ذ\.?\s*م\.?\s*م/i, /\bllc\b/i] },
  { value: "JSC", ar: "شركة مساهمة", patterns: [/مساهمة(?!\s*مبسطة)/i, /\bjsc\b/i] },
  { value: "Simplified Joint Stock Company", ar: "شركة مساهمة مبسطة", patterns: [/مساهمة\s*مبسطة/i] },
  { value: "Sole Proprietorship", ar: "مؤسسة فردية", patterns: [/مؤسسة\s*فردية/i, /^\s*فردية\s*$/i] },
  { value: "Partnership", ar: "شركة تضامن", patterns: [/تضامن/i] },
  { value: "Limited Partnership", ar: "شركة توصية بسيطة", patterns: [/توصية/i] },
  { value: "One-Person Company", ar: "شركة الشخص الواحد", patterns: [/شخص\s*(ال)?واحد/i] },
] as const;

// ─── Organization types (schema.org Organization subtypes) ───────────────────
export const ORGANIZATION_TYPES = [
  { value: "Organization", ar: "منظمة / شركة (عام)", patterns: [/^\s*(شركة|منظمة|مؤسسة)\s*$/i] },
  { value: "LocalBusiness", ar: "نشاط تجاري محلي", patterns: [/نشاط\s*محلي/i, /محل/i, /متجر/i] },
  { value: "Corporation", ar: "شركة كبرى (Corporation)", patterns: [/كوربوريشن/i, /شركة\s*كبرى/i] },
  { value: "NonProfit", ar: "منظمة غير ربحية", patterns: [/غير\s*ربحية/i, /خيري/i] },
  { value: "EducationalOrganization", ar: "مؤسسة تعليمية", patterns: [/تعليمي/i, /مدرسة/i, /جامعة/i, /معهد/i] },
  { value: "GovernmentOrganization", ar: "جهة حكومية", patterns: [/حكومي/i] },
  { value: "SportsOrganization", ar: "منظمة رياضية", patterns: [/رياضي/i, /نادي/i] },
  { value: "NGO", ar: "منظمة غير حكومية (NGO)", patterns: [/غير\s*حكومية/i, /\bngo\b/i] },
] as const;

// ─── Literal union types + value tuples (feed `z.enum`) ──────────────────────
export type LegalForm = (typeof LEGAL_FORMS)[number]["value"];
export type OrganizationType = (typeof ORGANIZATION_TYPES)[number]["value"];

export const LEGAL_FORM_VALUES = LEGAL_FORMS.map((o) => o.value) as [LegalForm, ...LegalForm[]];
export const ORGANIZATION_TYPE_VALUES = ORGANIZATION_TYPES.map((o) => o.value) as [OrganizationType, ...OrganizationType[]];

// ─── Normalizers — every write path runs input through these ─────────────────
function normalize(raw: string | null | undefined, options: readonly ClassificationOption[]): string | null {
  const v = (raw ?? "").trim();
  if (!v) return null;
  // Already canonical → keep as-is.
  if (options.some((o) => o.value === v)) return v;
  // Legacy / free-text (Arabic or loose) → map via patterns.
  for (const o of options) {
    if (o.patterns?.some((p) => p.test(v))) return o.value;
  }
  return null; // Unknown → caller decides (reject / clear / flag for manual fix).
}

export function normalizeLegalForm(raw: string | null | undefined): LegalForm | null {
  return normalize(raw, LEGAL_FORMS) as LegalForm | null;
}

export function normalizeOrganizationType(raw: string | null | undefined): OrganizationType | null {
  return normalize(raw, ORGANIZATION_TYPES) as OrganizationType | null;
}
