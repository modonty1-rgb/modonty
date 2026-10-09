import { db } from "@/lib/db";

import { SOCIAL_POST_SELECT, type SocialPostRow } from "./post-select";

/**
 * منشور واحد بكل حقوله وأصوله — للتفصيل والتعديل والإنتاج والنشر.
 * مقيّد بالعميل: رابط عميل مع منشور عميل آخر = غير موجود.
 */
export async function getPostDetail(clientId: string, postId: string): Promise<SocialPostRow | null> {
  if (!/^[a-f\d]{24}$/i.test(postId)) return null;
  return db.socialPost.findFirst({ where: { id: postId, clientId }, select: SOCIAL_POST_SELECT });
}
