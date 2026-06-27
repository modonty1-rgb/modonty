/**
 * YMYL runtime helpers — all read from ymyl-config.ts as the single source of truth.
 *
 * Used by:
 * - Admin Client edit page (validate ymylData on save)
 * - Console dynamic form (build field list, validate completeness)
 * - Publish gate (block YMYL articles missing reviewer or with forbidden claims)
 * - JSON-LD generator (read schemaType + specialty sub-type)
 */

import {
  YMYL_CATEGORIES,
  isYmylCategory,
  type AuthorityByCountry,
  type YmylCategory,
  type YmylCategoryConfig,
  type YmylField,
} from "@modonty/database/lib/seo/ymyl-config";

/** Get the full config for a category. Returns null if category is invalid/missing. */
export function getYmylConfig(category: string | null | undefined): YmylCategoryConfig | null {
  if (!isYmylCategory(category)) return null;
  return YMYL_CATEGORIES[category];
}

/** Required fields for a given category. Empty array if category invalid. */
export function getRequiredYmylFields(category: string | null | undefined): YmylField[] {
  const cfg = getYmylConfig(category);
  return cfg ? cfg.fields.filter((f) => f.required) : [];
}

/** Authority options for a given category + country (falls back to default). */
export function getAuthorityOptions(
  category: string | null | undefined,
  country: string | null | undefined,
  fieldKey: string
): string[] {
  const cfg = getYmylConfig(category);
  if (!cfg) return [];
  const field = cfg.fields.find((f) => f.key === fieldKey);
  if (!field?.options) return [];
  const opts: AuthorityByCountry = field.options;
  if (country && country in opts) {
    return opts[country as keyof AuthorityByCountry] ?? [];
  }
  return opts.default ?? [];
}

/**
 * Resolve the schema.org @type for a YMYL client.
 * Specialty-specific mapping wins over base schemaType.
 * Example: medical + dentistry → "Dentist" (not "MedicalClinic").
 */
export function resolveYmylSchemaType(
  category: string | null | undefined,
  ymylData: Record<string, unknown> | null | undefined
): string | null {
  const cfg = getYmylConfig(category);
  if (!cfg) return null;
  const specialtyValue = ymylData?.specialty;
  if (typeof specialtyValue === "string") {
    const specialtyField = cfg.fields.find((f) => f.type === "specialty");
    const match = specialtyField?.specialties?.find((s) => s.value === specialtyValue);
    if (match?.schemaSubType) return match.schemaSubType;
  }
  return cfg.schemaType;
}

export interface YmylValidationResult {
  valid: boolean;
  /** Map of fieldKey → human-readable Arabic error */
  errors: Record<string, string>;
  /** True when all required fields are present and non-empty */
  complete: boolean;
}

/**
 * Validate a ymylData blob against the category's field rules.
 * - Required fields must be present and non-empty
 * - Dropdown values must be in the allowed options for the client's country
 * - Specialty values must be a known specialty key
 *
 * Does NOT throw — returns a structured result for UI display.
 */
export function validateYmylData(
  category: string | null | undefined,
  ymylData: unknown,
  options: { country?: string | null; authorityCodes?: string[] } = {}
): YmylValidationResult {
  const cfg = getYmylConfig(category);
  if (!cfg) {
    return { valid: false, errors: { _category: "تصنيف YMYL غير صحيح" }, complete: false };
  }
  const data = (ymylData && typeof ymylData === "object" ? ymylData : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  for (const field of cfg.fields) {
    const value = data[field.key];
    const isEmpty = value === undefined || value === null || value === "";

    if (field.required && isEmpty) {
      errors[field.key] = `حقل "${field.label.ar}" مطلوب`;
      continue;
    }
    if (isEmpty) continue;

    if (field.type === "dropdown" && typeof value === "string") {
      // Prefer the live admin-managed authority codes (Reference Data); fall back
      // to the legacy hardcoded matrix when not supplied.
      const allowed =
        options.authorityCodes ?? getAuthorityOptions(category, options.country ?? null, field.key);
      if (allowed.length > 0 && !allowed.includes(value)) {
        errors[field.key] = `قيمة غير صحيحة لحقل "${field.label.ar}"`;
      }
    }
    if (field.type === "specialty" && typeof value === "string") {
      const validKeys = (field.specialties ?? []).map((s) => s.value);
      if (!validKeys.includes(value)) {
        errors[field.key] = `تخصص غير معروف في "${field.label.ar}"`;
      }
    }
  }

  const valid = Object.keys(errors).length === 0;
  return { valid, errors, complete: valid };
}

/** Quick predicate: is this client fully YMYL-ready (category set + required fields present)? */
export function isYmylClientComplete(client: {
  isYmyl: boolean;
  ymylCategory: string | null;
  ymylData: unknown;
  addressCountry?: string | null;
}): boolean {
  if (!client.isYmyl) return true; // non-YMYL is trivially "complete"
  return validateYmylData(client.ymylCategory, client.ymylData, {
    country: client.addressCountry ?? null,
  }).complete;
}

/**
 * Scan article content for forbidden claims of the client's YMYL category.
 * Returns the list of matched phrases (case-insensitive substring match).
 * Empty array = clean.
 */
export function findForbiddenClaims(
  category: string | null | undefined,
  content: string
): string[] {
  const cfg = getYmylConfig(category);
  if (!cfg || !content) return [];
  const haystack = content.toLowerCase();
  return cfg.forbiddenClaims.filter((claim) => haystack.includes(claim.toLowerCase()));
}

export interface PublishGateResult {
  canPublish: boolean;
  blockers: string[];
  warnings: string[];
}

/**
 * Pre-publish YMYL gate for an article.
 *
 * BLOCKERS (cannot publish):
 * - Client is YMYL but ymylData incomplete (missing required fields)
 * - Article has no reviewedById (Author reviewer)
 *
 * WARNINGS (can publish but flagged):
 * - Article content contains forbidden claims from this category
 */
export function checkYmylPublishGate(input: {
  client: {
    isYmyl: boolean;
    ymylCategory: string | null;
    ymylData: unknown;
    addressCountry?: string | null;
  };
  article: {
    content: string;
    reviewedById: string | null;
  };
}): PublishGateResult {
  const { client, article } = input;
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!client.isYmyl) {
    return { canPublish: true, blockers, warnings };
  }

  if (!isYmylClientComplete(client)) {
    blockers.push("بيانات YMYL للعميل غير مكتملة — أكمل التوثيق قبل النشر");
  }

  if (!article.reviewedById) {
    blockers.push("مقال YMYL يحتاج مُراجِع مختص — اختر مُراجِع قبل النشر");
  }

  const forbidden = findForbiddenClaims(client.ymylCategory, article.content);
  if (forbidden.length > 0) {
    warnings.push(`المقال يحتوي عبارات غير مسموحة في هذا التخصص: ${forbidden.join(" · ")}`);
  }

  return { canPublish: blockers.length === 0, blockers, warnings };
}
