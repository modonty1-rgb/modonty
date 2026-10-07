import "server-only";

import { db } from "@/lib/db";
import type { ClientFavoriteResult } from "./get-client-favorite-state";

/**
 * Remove a saved partner for a known reader — the body of `DELETE /clients/[slug]/api/favorite`
 * with the identity passed in. Shared with the mobile API.
 */
export async function unfavoriteClientAs(userId: string, decodedSlug: string): Promise<ClientFavoriteResult> {
  const client = await db.client.findUnique({
    where: { slug: decodedSlug },
    select: { id: true },
  });
  if (!client) return { found: false };

  await db.clientFavorite.deleteMany({
    where: { clientId: client.id, userId },
  });
  const count = await db.clientFavorite.count({ where: { clientId: client.id } });
  return { found: true, isFavorited: false, count };
}
