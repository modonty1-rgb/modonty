import { messages } from "@/lib/i18n/messages";
import type { LegalEntityDisplay } from "@/lib/seo/to-legal-entity-display";

const text = messages.trust.facts;

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
    { k: text.legalName, v: legal.legalName ?? "" },
    { k: text.status, v: legal.crStatus ?? "", active: legal.isRegistrationActive },
    { k: text.cr, v: legal.cr ?? "", ltr: true },
    { k: text.unifiedNumber, v: legal.unifiedNumber ?? "", ltr: true },
    { k: text.entityType, v: legal.entityType ?? "" },
    { k: text.registrationDate, v: legal.registrationDate ?? "" },
    { k: text.capital, v: legal.capital ? `${legal.capital} ${text.currency}` : "" },
  ];
  return rows.filter((r) => r.v !== "");
}
