import "server-only";

import { db } from "@/lib/db";
import { incrementCounters } from "@/lib/counters/increment-counters";
import { trackReelLike, trackReelFavorite } from "@/lib/analytics/events-registry";
import type { MediaReactionKind } from "@prisma/client";
import { fireClientEvent } from "@modonty/shared/lib/mobile-push";

export type ToggleResult =
  | { success: true; active: boolean; count: number }
  | { success: false; error: string };

function isUniqueViolation(e: unknown): boolean {
  const err = e as { code?: string; message?: string };
  return err?.code === "P2002" || (typeof err?.message === "string" && err.message.includes("Unique constraint failed"));
}

/**
 * Toggle a like or a favorite on a reel, for a known reader — the body of the web action
 * (`toggle-reel-reaction.ts`) with the identity passed in. Not a Server Action on purpose.
 *
 * Cache invalidation is NOT here: the web action calls `updateTag("reels")` (Server Actions
 * only), the mobile route calls `revalidateTag` (Route Handlers) — Next 16 forbids `updateTag`
 * outside a Server Action (node_modules/next/dist/docs/.../updateTag.md). Each door expires the
 * tag right after a successful toggle.
 *
 * Likes and favorites used to be two tables; they are one now, split by `kind`
 * (2026-08-05). The caller must have a signed-in user — for FAVORITE that check is the ONLY
 * thing enforcing it (a like may be anonymous in the table).
 */
export async function toggleReelReactionAs(userId: string, mediaId: string, kind: MediaReactionKind): Promise<ToggleResult> {
  try {
    const existing = await db.mediaReaction.findFirst({
      where: { mediaId, userId, kind },
      select: { id: true },
    });

    const field = kind === "LIKE" ? "likesCount" : "favoritesCount";

    // The counter moves only when a row really changed, with one atomic `$inc` outside any
    // transaction (incrementCounters) — same fix as article likes (29 Sep 2026).
    if (existing) {
      const { count: removed } = await db.mediaReaction.deleteMany({ where: { id: existing.id } });
      await incrementCounters("media", mediaId, { [field]: -removed });
    } else {
      const created = await db.mediaReaction
        .create({ data: { mediaId, kind, userId, sessionId: `user:${userId}` } })
        .then(() => true)
        .catch((e: unknown) => {
          if (!isUniqueViolation(e)) throw e;
          return false;
        });
      await incrementCounters("media", mediaId, { [field]: created ? 1 : 0 });
    }
    const updated = await db.media.findUniqueOrThrow({ where: { id: mediaId }, select: { likesCount: true, favoritesCount: true } });

    // GA4 gets the ADD only, never the undo. An «إعجاب» that is toggled off is not half an
    // engagement — counting both directions would inflate the number and make the ratio
    // meaningless. The DB counter above already carries the true total either way.
    if (!existing) {
      const reel = await db.media.findUnique({
        where: { id: mediaId },
        select: {
          reelSlug: true,
          bunnyVideoId: true,
          client: { select: { id: true, slug: true, name: true } },
        },
      });
      if (reel) {
        fireClientEvent(reel.client?.id, { kind: "media_reaction", mediaId });
        const params = {
          reel_id: mediaId,
          reel_slug: reel.reelSlug ?? mediaId,
          reel_kind: reel.bunnyVideoId ? "video" : "image",
          client_id: reel.client?.id,
          client_slug: reel.client?.slug,
          client_name: reel.client?.name,
        };
        // `void`: analytics must never delay the answer the button is waiting for.
        if (kind === "LIKE") void trackReelLike(params, { userId });
        else void trackReelFavorite(params, { userId });
      }
    }

    return { success: true, active: !existing, count: Math.max(0, updated[field]) };
  } catch {
    return { success: false, error: "server" };
  }
}
