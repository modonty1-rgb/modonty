"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { deleteMedia } from "@/lib/media/delete-media";

/**
 * After a new mini image is saved, remove the client's older ones. The mini has no field on
 * Client — the site shows the newest CLIENT_MINI row — so without this every replace left the
 * old one behind, counted under «Client Mini» and (until the guard change) undeletable.
 * Each goes through `deleteMedia`, so anything still in use elsewhere is kept.
 */
export async function replaceClientMini(clientId: string, newMediaId: string) {
  const session = await auth();
  if (!session) return { success: false as const, error: "Unauthorized", removed: 0 };

  const older = await db.media.findMany({
    where: { clientId, type: "CLIENT_MINI", id: { not: newMediaId } },
    select: { id: true },
  });
  let removed = 0;
  for (const m of older) {
    const r = await deleteMedia(m.id);
    if (r.success) removed++;
  }
  return { success: true as const, removed, kept: older.length - removed };
}
