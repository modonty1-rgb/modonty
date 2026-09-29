import "server-only";

import { db } from "@/lib/db";

/**
 * كود البريف التالي — `B-001`، `B-002`… يُكتب في اسم الحملة في المنصّة، وبه تُجمع حملاتها.
 * قصيرٌ ولاتينيّ عمداً: يُكتب في ميتا بلا خطأ، ويُقرأ في أيّ لغة.
 */
export async function nextCampaignCode(): Promise<string> {
  const rows = await db.adCampaign.findMany({ where: { code: { startsWith: "B-" } }, select: { code: true } });
  const max = rows.reduce((m, r) => Math.max(m, Number(r.code?.slice(2)) || 0), 0);
  return `B-${String(max + 1).padStart(3, "0")}`;
}
