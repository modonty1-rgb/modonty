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
  type YmylCategoryConfig,
} from "@modonty/shared/lib/seo/ymyl-config";

/** Get the full config for a category. Returns null if category is invalid/missing. */
function getYmylConfig(category: string | null | undefined): YmylCategoryConfig | null {
  if (!isYmylCategory(category)) return null;
  return YMYL_CATEGORIES[category];
}

/** Authority options for a given category + country (falls back to default). */
function getAuthorityOptions(
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

interface YmylValidationResult {
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

/**
 * Quick predicate: is this client fully YMYL-ready (category set + required fields present)?
 *
 * `authorityCodes` MUST be the live Reference Data list (`getYmylAuthorityCodes`) wherever
 * one can be fetched. Omitting it falls back to the hardcoded matrix, which is a strict
 * subset — a client who picked an admin-added authority would then read as incomplete
 * forever even though the dropdown offered that exact value (Khalid 2026-08-04).
 */
export function isYmylClientComplete(
  client: {
    isYmyl: boolean;
    ymylCategory: string | null;
    ymylData: unknown;
    addressCountry?: string | null;
  },
  authorityCodes?: string[]
): boolean {
  if (!client.isYmyl) return true; // non-YMYL is trivially "complete"
  return validateYmylData(client.ymylCategory, client.ymylData, {
    country: client.addressCountry ?? null,
    authorityCodes,
  }).complete;
}
