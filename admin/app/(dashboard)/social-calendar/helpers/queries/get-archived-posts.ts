import { db } from "@/lib/db";

import { SOCIAL_POST_SELECT, type SocialPostRow } from "./post-select";

/** المنشورات المؤرشفة لعميل — الأحدث أرشفةً أولاً. */
export async function getArchivedPosts(clientId: string): Promise<SocialPostRow[]> {
  return db.socialPost.findMany({
    where: { clientId, archivedAt: { not: null } },
    orderBy: [{ archivedAt: "desc" }],
    select: SOCIAL_POST_SELECT,
  });
}
