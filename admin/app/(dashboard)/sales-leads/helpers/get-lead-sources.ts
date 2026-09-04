import "server-only";

import { db } from "@/lib/db";

export interface LeadSourceChoice {
  value: string;
  label: string;
}

/**
 * «العميل من فين جاي» — القائمة كما ضبطها خالد، لا كما كُتبت في الكود.
 *
 * كانت ستّة ثوابت في `lead-form.tsx` مأخوذة عن `enum LeadSource`، فإضافة «معرض» كانت تعني
 * تعديل سكيما ونشراً. صارت صفوفاً في `lead_source_options` يحرّرها من «Dropdown Lists».
 *
 * ولا تُستورد من مسار الإعدادات رغم وجود `getActiveLeadSources` هناك: القاعدة تمنع استيراد
 * مسارٍ من شقيقه، والاستعلام هنا سطران — نسخهما أرخص من ربط شاشتين ببعضهما.
 */
export async function getLeadSources(): Promise<LeadSourceChoice[]> {
  return db.leadSourceOption.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { label: "asc" }],
    select: { value: true, label: true },
    take: 100,
  });
}
