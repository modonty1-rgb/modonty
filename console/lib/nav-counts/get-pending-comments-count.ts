import { CommentStatus } from "@prisma/client";
import { countBoth } from "@/lib/comments/count-both";

export async function getPendingCommentsCount(
  clientId: string
): Promise<number> {
  return countBoth(clientId, CommentStatus.PENDING);
}
