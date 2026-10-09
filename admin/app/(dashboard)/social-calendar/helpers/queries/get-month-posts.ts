import { db } from "@/lib/db";

import { monthRange } from "../dates";
import { SOCIAL_POST_NOT_ARCHIVED } from "../not-archived";
import { SOCIAL_POST_SELECT, type SocialPostRow } from "./post-select";

/** منشورات شهر واحد لعميل — حيّة فقط، باليوم ثم بالإنشاء (نفس ترتيب `getEntriesByMonth` القديم). */
export async function getMonthPosts(clientId: string, year: number, month: number): Promise<SocialPostRow[]> {
  const { start, end } = monthRange(year, month);
  return db.socialPost.findMany({
    where: { clientId, scheduledFor: { gte: start, lt: end }, ...SOCIAL_POST_NOT_ARCHIVED },
    orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }],
    select: SOCIAL_POST_SELECT,
  });
}
