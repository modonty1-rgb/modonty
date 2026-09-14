import { cacheTag } from "next/cache";

import { db } from "@/lib/db";

/**
 * بيانات المنشأة النظامية — نفس الحقول التي تقرؤها الفاتورة الضريبية
 * (`admin/lib/invoices/send-invoice-action.ts`)، فلا يختلف ما في العقد عمّا في الفاتورة.
 *
 * تحت وسم `settings`: تعديلها من شاشة بيانات المنشأة يظهر هنا بلا نشر.
 */
export type SellerLegal = {
  legalName: string | null;
  vatNumber: string | null;
  crNumber: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
};

export async function getSellerLegal(): Promise<SellerLegal> {
  "use cache";
  cacheTag("settings");

  const s = await db.settings.findFirst({
    select: {
      orgLegalName: true, orgVatNumber: true, orgCommercialRegistrationNumber: true,
      orgStreetAddress: true, orgAddressNeighborhood: true, orgAddressLocality: true,
      orgAddressCountry: true, orgContactEmail: true, orgContactTelephone: true,
    },
  });

  const t = (v: string | null | undefined) => v?.trim() || null;
  const COUNTRY: Record<string, string> = { SA: "المملكة العربية السعودية", EG: "جمهورية مصر العربية" };
  const country = t(s?.orgAddressCountry);

  return {
    legalName: t(s?.orgLegalName),
    vatNumber: t(s?.orgVatNumber),
    crNumber: t(s?.orgCommercialRegistrationNumber),
    address: [t(s?.orgStreetAddress), t(s?.orgAddressNeighborhood), t(s?.orgAddressLocality), country ? COUNTRY[country] ?? country : null]
      .filter(Boolean)
      .join(" · ") || null,
    email: t(s?.orgContactEmail),
    phone: t(s?.orgContactTelephone),
  };
}
