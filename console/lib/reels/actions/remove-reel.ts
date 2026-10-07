"use server";

import { revalidatePath } from "next/cache";

import { getSessionClientId } from "@/lib/get-session-client-id";
import { db } from "@/lib/db";
import { messages } from "@/lib/messages";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import type { Result } from "../result";

/**
 * Remove a reel the client created here.
 *
 * Same rule as the gallery tick: a reel visitors may already have seen is archived, not
 * destroyed, so their comments and likes survive. Anything still unseen is deleted —
 * and because the row IS the file, that delete is the file's delete too, which is why
 * only a reel with nothing hanging off it is allowed to go.
 *
 * A reel that also sits in the gallery is managed by that image's tick, not from here.
 */
export async function removeReel(mediaId: string): Promise<Result> {
  const clientId = await getSessionClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const owned = await db.media.findFirst({
      where: { id: mediaId, clientId, inReels: true },
      select: {
        id: true,
        reelStatus: true,
        inGallery: true,
        commentsCount: true,
        likesCount: true,
      },
    });
    if (!owned) return { success: false, error: messages.error.notFound };

    if (owned.inGallery) {
      return { success: false, error: "هذا الريل من معرض الصور — شيل العلامة من الصورة نفسها" };
    }

    const seenByVisitors =
      owned.reelStatus === "APPROVED" || owned.reelStatus === "PUBLISHED";
    const hasEngagement = owned.commentsCount > 0 || owned.likesCount > 0;
    if (seenByVisitors || hasEngagement) {
      await db.media.update({
        where: { id: mediaId },
        data: { inReels: false, reelStatus: "ARCHIVED" },
      });
    } else {
      await db.media.delete({ where: { id: mediaId } });
    }

    // A reel visitors could already see has to leave modonty NOW — `revalidatePath` below
    // busts this console route only, and modonty caches the feed and every watch page under
    // its own "reels" tag.
    if (seenByVisitors) await revalidateModontyTag("reels").catch(() => {});

    revalidatePath("/dashboard/reels");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
