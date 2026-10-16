import { db } from "@/lib/db";

import { pushIf, type DeleteBlockers } from "./delete-blockers";

/**
 * صناعة عليها عملاء أو عملاء محتملون ما تنحذف. العملاء المحتملون (`SalesLead.industry`)
 * علاقتهم NoAction، فالحذف كان يتركهم يشيرون لصناعة غير موجودة.
 */
export async function getIndustryDeleteBlockers(ids: string[]): Promise<DeleteBlockers> {
  const rows = await db.industry.findMany({
    where: { id: { in: ids } },
    select: { id: true, _count: { select: { clients: true, salesLeads: true } } },
  });
  const out: DeleteBlockers = new Map();
  for (const r of rows) {
    const why: string[] = [];
    pushIf(why, r._count.clients, "عميل عليها — ادمجها في صناعة أخرى أولاً");
    pushIf(why, r._count.salesLeads, "عميل محتمل في المبيعات عليها");
    out.set(r.id, why);
  }
  return out;
}
