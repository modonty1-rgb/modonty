import "server-only";

import { db } from "@/lib/db";

export type ClientFollowResult =
  | { found: false }
  | { found: true; isFollowing: boolean; followersCount: number };

/**
 * Does this reader follow this partner, and how many follow it — the body of
 * `GET /clients/[slug]/api/follow` with the identity passed in. Shared with the mobile API.
 */
export async function getClientFollowState(userId: string, decodedSlug: string): Promise<ClientFollowResult> {
  const client = await db.client.findUnique({
    where: { slug: decodedSlug },
    select: { id: true },
  });
  if (!client) return { found: false };

  const followRecord = await db.clientLike.findUnique({
    where: {
      clientId_userId: {
        clientId: client.id,
        userId,
      },
    },
  });

  const followersCount = await db.clientLike.count({
    where: { clientId: client.id },
  });

  return { found: true, isFollowing: !!followRecord, followersCount };
}
