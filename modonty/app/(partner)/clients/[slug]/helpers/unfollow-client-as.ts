import "server-only";

import { db } from "@/lib/db";
import type { ClientFollowResult } from "./get-client-follow-state";

/**
 * Unfollow a partner for a known reader — the body of `DELETE /clients/[slug]/api/follow`
 * with the identity passed in. Shared with the mobile API.
 */
export async function unfollowClientAs(userId: string, decodedSlug: string): Promise<ClientFollowResult> {
  const client = await db.client.findUnique({
    where: { slug: decodedSlug },
    select: { id: true },
  });
  if (!client) return { found: false };

  await db.clientLike.deleteMany({
    where: {
      clientId: client.id,
      userId,
    },
  });

  const followersCount = await db.clientLike.count({
    where: { clientId: client.id },
  });

  return { found: true, isFollowing: false, followersCount };
}
