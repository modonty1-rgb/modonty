"use server";

import { revalidatePath } from "next/cache";

import { getSessionClientId } from "@/lib/get-session-client-id";
import { db } from "@/lib/db";
import { messages } from "@/lib/messages";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { discardVideo } from "../discard-video";
import type { Result } from "../result";

/**
 * Remove a video reel. Same archive-vs-delete rule as an image reel, with one addition:
 * a real delete has to take the file off Bunny too, or we keep paying for storage nobody
 * can reach.
 */
export async function removeVideoReel(mediaId: string): Promise<Result> {
  const clientId = await getSessionClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const owned = await db.media.findFirst({
      where: { id: mediaId, clientId, inReels: true },
      select: {
        id: true,
        bunnyVideoId: true,
        reelStatus: true,
        commentsCount: true,
        likesCount: true,
      },
    });
    if (!owned) return { success: false, error: messages.error.notFound };

    const seenByVisitors =
      owned.reelStatus === "APPROVED" || owned.reelStatus === "PUBLISHED";
    const hasEngagement = owned.commentsCount > 0 || owned.likesCount > 0;

    if (seenByVisitors || hasEngagement) {
      // Archived, not destroyed — visitors' comments and likes hang off this row.
      await db.media.update({
        where: { id: mediaId },
        data: { inReels: false, reelStatus: "ARCHIVED" },
      });
    } else {
      await discardVideo(owned.id, owned.bunnyVideoId);
    }

    // A reel the visitors could already see has to leave modonty NOW. `revalidatePath` below
    // busts this console route only — modonty caches the feed and each watch page under its
    // own "reels" tag, so without this hit the removed reel kept serving at HTTP 200 for the
    // whole cache window (measured 25 Aug 2026).
    if (seenByVisitors) await revalidateModontyTag("reels").catch(() => {});

    revalidatePath("/dashboard/videos");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
