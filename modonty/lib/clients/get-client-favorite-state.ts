import "server-only";

import { db } from "@/lib/db";

export type ClientFavoriteResult =
  | { found: false }
  | { found: true; isFavorited: boolean; count: number };

/**
 * Has this reader saved this partner, and how many have — the body of
 * `GET /clients/[slug]/api/favorite` with the identity passed in. Shared with the mobile API.
 */
export async function getClientFavoriteState(userId: string, decodedSlug: string): Promise<ClientFavoriteResult> {
  const client = await db.client.findUnique({
    where: { slug: decodedSlug },
    select: { id: true },
  });
  if (!client) return { found: false };

  const [existing, count] = await Promise.all([
    db.clientFavorite.findUnique({
      where: { clientId_userId: { clientId: client.id, userId } },
      select: { id: true },
    }),
    db.clientFavorite.count({ where: { clientId: client.id } }),
  ]);
  return { found: true, isFavorited: !!existing, count };
}
