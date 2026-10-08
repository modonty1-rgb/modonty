import type { SocialPostStatus } from "@prisma/client";

import { db } from "@/lib/db";

import { SOCIAL_POST_NOT_ARCHIVED } from "../not-archived";

export type StatusTotals = Record<SocialPostStatus, number> & { total: number };

/** إحصاء «All months» في رأس التقويم — كل منشورات العميل الحيّة بالحالة (القديم: `getAllStats`). */
export async function getClientStatusTotals(clientId: string): Promise<StatusTotals> {
  const groups = await db.socialPost.groupBy({
    by: ["status"],
    where: { clientId, ...SOCIAL_POST_NOT_ARCHIVED },
    _count: { _all: true },
  });
  const totals: StatusTotals = { IN_PRODUCTION: 0, READY_FOR_REVIEW: 0, READY_TO_PUBLISH: 0, PUBLISHED: 0, total: 0 };
  for (const g of groups) {
    totals[g.status] = g._count._all;
    totals.total += g._count._all;
  }
  return totals;
}
