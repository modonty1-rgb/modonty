"use server";

import { revalidatePath } from "next/cache";

import { getSessionClientId } from "@/lib/get-session-client-id";
import { db } from "@/lib/db";
import { messages } from "@/lib/messages";
import type { Result } from "../result";

/**
 * Replace the cover (ق9 — the third field the client owns for a video).
 *
 * Bunny extracts a frame automatically, and that frame is sometimes a blink or a blur.
 * The cover is the first thing a visitor sees and the `thumbnailUrl` Google requires, so
 * the client can override it with a still of their own — uploaded through the ordinary
 * image route into the reels zone, exactly like a picture reel.
 */
export async function setVideoCover(mediaId: string, url: string): Promise<Result> {
  const clientId = await getSessionClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const clean = url.trim();
  if (!clean.startsWith("https://")) return { success: false, error: messages.error.serverError };

  try {
    const owned = await db.media.findFirst({
      where: { id: mediaId, clientId, inReels: true },
      select: { id: true, reelStatus: true },
    });
    if (!owned) return { success: false, error: messages.error.notFound };

    // Same freeze as the text: an approved reel shows the cover Modonty signed off on.
    if (owned.reelStatus === "APPROVED" || owned.reelStatus === "PUBLISHED") {
      return { success: false, error: "المقطع معتمد — كلّم مُدَوَّنَتِي لتغيير الغلاف" };
    }

    await db.media.update({ where: { id: mediaId }, data: { thumbnailUrl: clean } });
    revalidatePath("/dashboard/videos");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
