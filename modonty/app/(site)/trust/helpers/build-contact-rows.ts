import { CONTACT_EMAIL } from "@/constants";
import { messages } from "@/lib/i18n/messages";
import { IconMapPin, IconEmail, IconClock, IconMessage } from "@/lib/icons";
import type { LegalEntityDisplay } from "@/lib/seo/to-legal-entity-display";

const text = messages.trust.location.contact;

export interface ContactRow {
  Icon: typeof IconMapPin;
  k: string;
  v: string;
  ltr?: boolean;
}

/** The contact list. The address leads when it is on file — it is the row that proves the rest. */
export function buildContactRows(legal: LegalEntityDisplay): ContactRow[] {
  const rows: ContactRow[] = [
    { Icon: IconEmail, k: text.email, v: CONTACT_EMAIL, ltr: true },
    { Icon: IconClock, k: text.hours, v: text.hoursValue },
    { Icon: IconMessage, k: text.direct, v: text.directValue },
  ];
  if (legal.address) {
    rows.unshift({ Icon: IconMapPin, k: text.address, v: legal.address });
  }
  return rows;
}
