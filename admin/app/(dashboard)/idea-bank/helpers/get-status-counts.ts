import { db } from "@/lib/db";
import type { IdeaBankStatus } from "@prisma/client";
import { IDEA_STATUSES } from "./get-idea-bank";

/** عدّاد كل قرار على البنك كلّه — يجلس فوق التبويبات (خالد ١٥ أكتوبر ٢٠٢٦). */
export async function getStatusCounts(): Promise<Record<IdeaBankStatus, number>> {
  const grouped = await db.ideaBankItem.groupBy({ by: ["status"], _count: { _all: true } });
  const counts = Object.fromEntries(IDEA_STATUSES.map((s) => [s, 0])) as Record<IdeaBankStatus, number>;
  for (const g of grouped) counts[g.status] = g._count._all;
  return counts;
}
