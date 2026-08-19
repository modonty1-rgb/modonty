import { CONTACT_EMAIL } from "@/constants";
import { IconMapPin, IconEmail, IconClock, IconMessage } from "@/lib/icons";
import type { LegalEntityDisplay } from "@/lib/seo/to-legal-entity-display";

export interface ContactRow {
  Icon: typeof IconMapPin;
  k: string;
  v: string;
  ltr?: boolean;
}

/** The contact list. The address leads when it is on file — it is the row that proves the rest. */
export function buildContactRows(legal: LegalEntityDisplay): ContactRow[] {
  const rows: ContactRow[] = [
    { Icon: IconEmail, k: "البريد الرسمي", v: CONTACT_EMAIL, ltr: true },
    { Icon: IconClock, k: "ساعات العمل", v: "على مدار الساعة — 24/7" },
    { Icon: IconMessage, k: "تواصل مباشر", v: "واتساب + نموذج تواصل + دعم داخل اللوحة" },
  ];
  if (legal.address) {
    rows.unshift({ Icon: IconMapPin, k: "العنوان (حسب السجل الرسمي)", v: legal.address });
  }
  return rows;
}
