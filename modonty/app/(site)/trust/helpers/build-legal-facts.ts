import type { LegalEntityDisplay } from "@/lib/seo/to-legal-entity-display";

export interface LegalFact {
  k: string;
  v: string;
  ltr?: boolean;
  active?: boolean;
}

/**
 * The registry rows, built from Settings.
 *
 * A field the team has not filled is dropped, so the list never shows a label with an empty
 * value beside it — an empty row on a page whose whole point is verifiability reads as a gap
 * in the record itself.
 */
export function buildLegalFacts(legal: LegalEntityDisplay): LegalFact[] {
  const rows: LegalFact[] = [
    { k: "الاسم القانوني", v: legal.legalName ?? "" },
    { k: "الحالة", v: legal.crStatus ?? "", active: legal.isRegistrationActive },
    { k: "رقم السجل التجاري", v: legal.cr ?? "", ltr: true },
    { k: "الرقم الوطني الموحّد", v: legal.unifiedNumber ?? "", ltr: true },
    { k: "نوع الكيان", v: legal.entityType ?? "" },
    { k: "تاريخ القيد", v: legal.registrationDate ?? "" },
    { k: "رأس المال", v: legal.capital ? `${legal.capital} ﷼` : "" },
  ];
  return rows.filter((r) => r.v !== "");
}
