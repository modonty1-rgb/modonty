/**
 * Valid schema.org Organization @type values — SINGLE SOURCE OF TRUTH.
 *
 * Every client/publisher Organization node the platform emits uses one of these
 * `@type` values. Two consumers MUST agree on this set, and historically they
 * drifted (the pre-publish gate validator kept a stale hardcoded list while the
 * generators learned new subtypes) — which silently blocked every medical/local
 * client. This file ends that drift:
 *
 *   - JSON-LD generators  → `safeOrganizationType()` guards `@type` so a bad
 *     `Client.organizationType` value can never emit an invalid schema.org type.
 *   - Gate validator (admin) → checks the publisher/author node `@type` against
 *     `ORGANIZATION_SCHEMA_TYPES`, so it accepts exactly what the generators emit.
 *
 * Union of three groups (add new types here, nowhere else):
 *   1. General org types         — `ORGANIZATION_TYPE_VALUES` (client-classification)
 *   2. Local / place businesses  — geo-aware subtypes
 *   3. YMYL schema subtypes      — must stay a SUPERSET of the `schemaSubType`
 *      values in `console/lib/seo/ymyl-config.ts` (medical / legal / financial)
 */
import { ORGANIZATION_TYPE_VALUES } from "../constants/client-classification";

// schema.org LocalBusiness subtypes the platform supports. All verified subclasses
// of Organization on schema.org (LocalBusiness → Organization). NOTE: bare "Place"
// is intentionally excluded — schema.org Place is NOT an Organization (Thing > Place),
// so it's invalid as an Article publisher.
export const LOCAL_BUSINESS_SCHEMA_TYPES = [
  "LocalBusiness",
  "MedicalClinic",
  "Dentist",
  "Hospital",
  "Physician",
  "Restaurant",
  "Store",
  "ProfessionalService",
  "LegalService",
  "FinancialService",
  "HealthAndBeautyBusiness",
  "AutomotiveBusiness",
  "HomeAndConstructionBusiness",
  "FoodEstablishment",
  "Pharmacy",
] as const;

// YMYL schema subtypes — keep in sync with `console/lib/seo/ymyl-config.ts`
// (medical / legal / financial specialty → schemaSubType). Parents included so a
// generic medical/financial org node still validates.
export const YMYL_SCHEMA_TYPES = [
  // medical
  "MedicalOrganization",
  "MedicalBusiness",
  "Optician",
  "PhysicalTherapy",
  "Dietitian",
  "DiagnosticLab",
  // financial
  "InsuranceAgency",
  "AccountingService",
  "RealEstateAgent",
  "BankOrCreditUnion",
] as const;

/** Every valid client/publisher Organization `@type` the platform can emit. */
export const ORGANIZATION_SCHEMA_TYPES: ReadonlySet<string> = new Set<string>([
  ...ORGANIZATION_TYPE_VALUES,
  ...LOCAL_BUSINESS_SCHEMA_TYPES,
  ...YMYL_SCHEMA_TYPES,
]);

/** True when `t` is a schema.org Organization `@type` the platform supports. */
export function isValidOrganizationSchemaType(t: string | null | undefined): boolean {
  return !!t && ORGANIZATION_SCHEMA_TYPES.has(t.trim());
}

/**
 * Safe `@type` for a client Organization node. Returns the value when it is a
 * known schema.org type, otherwise falls back to the always-valid `"Organization"`
 * — so legacy/free-text values (e.g. an Arabic label) can never produce invalid
 * schema that breaks Google rich results or the publish gate.
 */
export function safeOrganizationType(t: string | null | undefined): string {
  return isValidOrganizationSchemaType(t) ? (t as string).trim() : "Organization";
}
