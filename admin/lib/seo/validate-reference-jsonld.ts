/**
 * Runs the three validators over a reference entity's @graph — category · tag · industry —
 * and returns the report to store in `jsonLdValidationReport`.
 *
 * It exists because those three generators used to write a constant:
 *
 *   jsonLdValidationReport: { valid: true, generatedAt: new Date().toISOString() }
 *
 * Nothing was ever validated. The admin dashboard reads that column and awarded the entity
 * full marks on «تقرير المدقّقات» for data no validator had seen — a report that reassures
 * falsely. The same hardcode was removed from the listing-page path earlier (see the comment
 * above `richJsonLdFor` in `listing-page-seo-generator.ts`); this closes the entity path.
 *
 * The three graphs (CollectionPage + BreadcrumbList + DefinedTerm + Organization + WebSite)
 * are the same shape the listing pages emit, so they go through the same validator:
 * `validateHomeOrListPageJsonLd` — Adobe schema.org + Ajv + jsonld.js + the house rules.
 *
 * Dynamic import for the same reason `listing-page-seo-generator.ts` uses one: the three
 * generators are pulled into many entity actions, and the validator drags in the Adobe
 * validator, Ajv and jsonld.js behind it.
 */

import type { Prisma } from "@prisma/client";

/**
 * The stored shape when the validator could not run at all (schema.org unreachable, the
 * library threw). `checked: false` is read by `hasValidatorOutput` in
 * `shared/lib/seo/client/types.ts`, so the screen shows «لم يُفحص» instead of a score.
 * Never claim `valid` here — an unavailable validator is not a passing one.
 */
interface UncheckedReport {
  checked: false;
  /** Why it did not run — shown to whoever reads the entity's SEO screen. */
  uncheckedReason: string;
  attemptedAt: string;
}

export async function validateReferenceJsonLd(jsonLd: object): Promise<Prisma.InputJsonValue> {
  try {
    const { validateHomeOrListPageJsonLd } = await import(
      "@/app/(dashboard)/modonty/setting/helpers/modonty-jsonld-validator"
    );
    const report = await validateHomeOrListPageJsonLd(jsonLd);
    return JSON.parse(JSON.stringify(report)) as Prisma.InputJsonValue;
  } catch (error) {
    const unchecked: UncheckedReport = {
      checked: false,
      uncheckedReason: error instanceof Error ? error.message : String(error),
      attemptedAt: new Date().toISOString(),
    };
    return unchecked as unknown as Prisma.InputJsonValue;
  }
}
