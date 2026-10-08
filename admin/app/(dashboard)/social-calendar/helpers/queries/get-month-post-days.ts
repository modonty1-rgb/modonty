import { db } from "@/lib/db";

import { monthRange } from "../dates";
import { SOCIAL_POST_NOT_ARCHIVED } from "../not-archived";

/** أيام الشهر التي فيها منشور — لتلوين تقويم النموذج (أخضر = فيه منشور). */
export async function getMonthPostDays(clientId: string, year: number, month: number): Promise<number[]> {
  const { start, end } = monthRange(year, month);
  const rows = await db.socialPost.findMany({
    where: { clientId, scheduledFor: { gte: start, lt: end }, ...SOCIAL_POST_NOT_ARCHIVED },
    select: { scheduledFor: true },
  });
  return [...new Set(rows.map((r) => r.scheduledFor.getUTCDate()))];
}
