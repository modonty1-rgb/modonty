import { db } from "@/lib/db";
import { CommentStatus } from "@prisma/client";

export async function getPendingClientReviewsCount(
  clientId: string
): Promise<number> {
  return db.clientReview.count({
    where: { clientId, status: CommentStatus.PENDING },
  });
}
