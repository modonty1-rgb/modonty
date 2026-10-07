import { db } from "@/lib/db";
import { CommentStatus } from "@prisma/client";

export async function getPendingClientCommentsCount(
  clientId: string
): Promise<number> {
  return db.clientComment.count({
    where: { clientId, status: CommentStatus.PENDING },
  });
}
