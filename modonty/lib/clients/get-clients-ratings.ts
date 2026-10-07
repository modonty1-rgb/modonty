import { cacheTag, cacheLife } from "next/cache";
import { CommentStatus } from "@prisma/client";

import { db } from "@/lib/db";

/** Review averages for the listed partners. Keyed by the id list so a different page of
 *  partners gets its own entry rather than reusing another category's averages. */
export async function getClientsRatings(clientIds: string[]) {
  "use cache";
  cacheTag("reviews");
  cacheLife("hours");
  if (clientIds.length === 0) return [];
  return db.clientReview.groupBy({
    by: ["clientId"],
    where: { clientId: { in: clientIds }, status: CommentStatus.APPROVED },
    _avg: { rating: true },
  });
}
