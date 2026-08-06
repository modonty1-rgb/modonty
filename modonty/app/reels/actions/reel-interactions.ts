"use server";

import { updateTag } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { MediaReactionKind } from "@prisma/client";

type ToggleResult =
  | { success: true; active: boolean; count: number }
  | { success: false; error: string };

function isUniqueViolation(e: unknown): boolean {
  const err = e as { code?: string; message?: string };
  return err?.code === "P2002" || (typeof err?.message === "string" && err.message.includes("Unique constraint failed"));
}

/**
 * Toggle a like or a favorite on a reel.
 *
 * Likes and favorites used to be two tables; they are one now, split by `kind`
 * (2026-08-05). Both paths still demand a signed-in user — and for FAVORITE that check
 * is now the ONLY thing enforcing it: the old table had a non-nullable `userId`, the
 * merged one cannot, because a like may be anonymous. Removing this guard would silently
 * allow anonymous favorites.
 */
async function toggleReaction(mediaId: string, kind: MediaReactionKind): Promise<ToggleResult> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "unauthorized" };

    const existing = await db.mediaReaction.findFirst({
      where: { mediaId, userId, kind },
      select: { id: true },
    });

    const field = kind === "LIKE" ? "likesCount" : "favoritesCount";
    let updated: { likesCount: number; favoritesCount: number };

    if (existing) {
      await db.mediaReaction.delete({ where: { id: existing.id } }).catch(() => {});
      updated = await db.media.update({
        where: { id: mediaId },
        data: { [field]: { decrement: 1 } },
        select: { likesCount: true, favoritesCount: true },
      });
    } else {
      await db.mediaReaction
        .create({ data: { mediaId, kind, userId, sessionId: `user:${userId}` } })
        .catch((e: unknown) => {
          if (!isUniqueViolation(e)) throw e;
        });
      updated = await db.media.update({
        where: { id: mediaId },
        data: { [field]: { increment: 1 } },
        select: { likesCount: true, favoritesCount: true },
      });
    }

    // Read-your-own-writes: expire the cached feed so counters reflect immediately.
    updateTag("reels");
    return { success: true, active: !existing, count: Math.max(0, updated[field]) };
  } catch {
    return { success: false, error: "server" };
  }
}

export async function toggleReelLike(mediaId: string): Promise<ToggleResult> {
  return toggleReaction(mediaId, "LIKE");
}

export async function toggleReelFavorite(mediaId: string): Promise<ToggleResult> {
  return toggleReaction(mediaId, "FAVORITE");
}
