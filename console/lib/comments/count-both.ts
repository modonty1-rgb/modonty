import { db } from "@/lib/db";
import { CommentStatus } from "@prisma/client";

/** Both tables, one number per status — the KPI cards sit above one merged queue. */
export async function countBoth(clientId: string, status: CommentStatus): Promise<number> {
  const [articles, reels] = await Promise.all([
    db.comment.count({ where: { article: { clientId }, status } }),
    db.mediaComment.count({ where: { media: { clientId, inReels: true }, status } }),
  ]);
  return articles + reels;
}
