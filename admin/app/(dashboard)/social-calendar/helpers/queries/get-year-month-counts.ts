import { db } from "@/lib/db";

import { SOCIAL_POST_NOT_ARCHIVED } from "../not-archived";

/** عدد المنشورات الحيّة في كل شهر من سنة واحدة — عدّادات الشريط الجانبي (index = الشهر 0-11). */
export async function getYearMonthCounts(clientId: string, year: number): Promise<number[]> {
  const rows = await db.socialPost.findMany({
    where: {
      clientId,
      scheduledFor: { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) },
      ...SOCIAL_POST_NOT_ARCHIVED,
    },
    select: { scheduledFor: true },
  });
  const counts = Array.from({ length: 12 }, () => 0);
  for (const r of rows) counts[r.scheduledFor.getUTCMonth()] += 1;
  return counts;
}
