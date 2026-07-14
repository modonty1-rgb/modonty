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

// YMYL subtypes that ARE LocalBusiness descendants — every one verified on schema.org
// (2026-07-14). Being under LocalBusiness → Place is what lets them carry address, geo,
// openingHoursSpecification and priceRange, so these belong in the local family below.
//
// Two entries here were wrong before that check, and both produced schema Google cannot
// read:
//   · "PhysicalTherapy" is a MedicalProcedure, not a business — a clinic typed with it was
//     calling itself a treatment. The business type is "Physiotherapy".
//   · "Dietitian" does not exist on schema.org at all (404). The business type is
//     "DietNutrition".
export const YMYL_LOCAL_SCHEMA_TYPES = [
  // medical — Organization > LocalBusiness > MedicalBusiness > …
  "MedicalBusiness",
  "Optician",
  "Physiotherapy",
  "DietNutrition",
  // financial / professional — all resolve under LocalBusiness
  "InsuranceAgency",
  "AccountingService",
  "RealEstateAgent",
  "BankOrCreditUnion",
] as const;

// YMYL subtypes that are valid Organizations but sit OUTSIDE the LocalBusiness/Place
// family (schema.org: Thing > Organization > MedicalOrganization > …). They are legal to
// emit as an @type, but they inherit no Place properties — so they must NEVER open the
// geo / openingHours / priceRange block, or we ship properties the type cannot hold.
export const YMYL_NON_LOCAL_SCHEMA_TYPES = [
  "MedicalOrganization",
  "DiagnosticLab",
] as const;

/** Every YMYL subtype the platform can emit, local or not. */
export const YMYL_SCHEMA_TYPES = [
  ...YMYL_LOCAL_SCHEMA_TYPES,
  ...YMYL_NON_LOCAL_SCHEMA_TYPES,
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

/**
 * Container types: valid, but they are the PARENTS every specific type descends from.
 * Storing one on a client says "a business" — it never says WHICH. They must always
 * lose to a type we can actually derive.
 *
 * Google, verbatim (developers.google.com/search/docs/appearance/structured-data/local-business):
 *   "Use the most specific LocalBusiness sub-type possible; for example, Restaurant,
 *    DaySpa, HealthClub, and so on."
 *
 * schema.org confirms the family (checked 2026-07-14): Dentist and MedicalClinic both
 * sit UNDER LocalBusiness — so upgrading LocalBusiness → Dentist loses nothing and gains
 * the medical identity. Corporation and NGO, by contrast, hang off Organization and are
 * NOT LocalBusiness descendants: they carry no geo / openingHours and cannot produce a
 * local-business result at all.
 */
const CONTAINER_TYPES: ReadonlySet<string> = new Set(["Organization", "LocalBusiness"]);

/** True when `t` says "a business" without saying which one. */
export function isContainerOrganizationType(t: string | null | undefined): boolean {
  return CONTAINER_TYPES.has(String(t ?? "").trim());
}

/**
 * THE list of types that descend from LocalBusiness → Place, and therefore may carry
 * address / geo / openingHoursSpecification / priceRange. Every entry verified against
 * its schema.org hierarchy (2026-07-14).
 *
 * This is the single source for that question. The JSON-LD builder used to keep its own
 * hand-typed copy, which had drifted: it was missing Optician, so two eye clinics were
 * handed the medical type and then denied the address and hours that type exists to carry.
 * Import this — never re-type it.
 */
export const LOCAL_FAMILY: ReadonlySet<string> = new Set<string>([
  "LocalBusiness",
  "Place",
  ...LOCAL_BUSINESS_SCHEMA_TYPES,
  ...YMYL_LOCAL_SCHEMA_TYPES,
  // YMYL_NON_LOCAL_SCHEMA_TYPES stay OUT by design — MedicalOrganization and DiagnosticLab
  // hang off Organization, not Place, and inherit none of these properties.
]);

/** True when `t` can carry Place properties (address, geo, opening hours, price range). */
export function isLocalFamilyType(t: string | null | undefined): boolean {
  return LOCAL_FAMILY.has(String(t ?? "").trim());
}

/**
 * Resolve the ONE `@type` a client card should carry — industry-agnostic by design.
 *
 * The rule is Google's, not ours: the most specific valid type wins. Nothing here knows
 * or cares that today's specific types happen to be medical; the day a furniture shop
 * derives `FurnitureStore` or a shop derives `OnlineStore`, the same three lines decide it.
 *
 *   1. stored type is a container ("a business")   → the derived type wins
 *   2. stored type is outside the local family but the derived type is inside it
 *      (a clinic stored as Corporation / NGO)      → the derived type wins: a place people
 *                                                    walk into cannot be typed as something
 *                                                    that carries no address or hours
 *   3. otherwise the stored type is a deliberate, specific, compatible choice → it stays
 *
 * `derived` is whatever the caller could work out about this client (today: the YMYL
 * config; tomorrow: an industry map). Pass null when nothing is known and the stored
 * value is returned untouched.
 */
export function resolveOrganizationType(
  stored: string | null | undefined,
  derived: string | null | undefined,
): string | null {
  const s = String(stored ?? "").trim() || null;
  const d = String(derived ?? "").trim() || null;

  if (!d) return s;
  if (!s) return d;

  if (isContainerOrganizationType(s)) return d;
  if (!LOCAL_FAMILY.has(s) && LOCAL_FAMILY.has(d)) return d;

  return s;
}
