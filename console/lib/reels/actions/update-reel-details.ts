"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { getSessionClientId } from "@/lib/get-session-client-id";
import { db } from "@/lib/db";
import { messages } from "@/lib/messages";
import { notifyReelPending } from "@/lib/notify-reel-pending";
import type { Result } from "../result";

interface ReelDetailsInput {
  title: string;
  description: string;
  /** Ignored for a video reel — a moving picture is described by its title and transcript. */
  altText: string;
}

/**
 * The three fields the client owns (ق9, 2026-08-05): title, description, and — for an
 * image reel — the alt text. Everything else Google wants is derived, so this is the only
 * writing surface the client gets, and Modonty corrects it at approval.
 *
 * Editable while the reel is waiting or was rejected; frozen once approved.
 */
export async function updateReelDetails(
  mediaId: string,
  input: ReelDetailsInput
): Promise<Result> {
  const clientId = await getSessionClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const cleanTitle = input.title.trim();
  if (!cleanTitle) return { success: false, error: "العنوان ما يصير فاضي" };

  try {
    const owned = await db.media.findFirst({
      where: { id: mediaId, clientId, inReels: true },
      select: { id: true, reelStatus: true, mimeType: true },
    });
    if (!owned) return { success: false, error: messages.error.notFound };

    // Once approved or live, the text is what Modonty signed off on — editing it silently
    // would let published wording change after review.
    if (owned.reelStatus === "APPROVED" || owned.reelStatus === "PUBLISHED") {
      return { success: false, error: "الريل معتمد — كلّم مُدَوَّنَتِي لتعديل النص" };
    }

    await db.media.update({
      where: { id: mediaId },
      data: {
        title: cleanTitle.slice(0, 100),
        description: input.description.trim().slice(0, 500) || null,
        // Only an image carries alt text; writing it on a video would put a caption
        // nobody reads on a file Google judges by its VideoObject instead.
        ...(owned.mimeType.startsWith("image/")
          ? { altText: input.altText.trim().slice(0, 200) || null }
          : {}),
        // A rejected reel the client fixed goes back into the queue.
        ...(owned.reelStatus === "REJECTED"
          ? { reelStatus: "PENDING_APPROVAL" as const, reelRejectionReason: null }
          : {}),
      },
    });

    // A fix after a rejection re-enters the same queue, so it needs the same signal —
    // otherwise the client waits on a correction nobody was told about.
    if (owned.reelStatus === "REJECTED") {
      after(async () => {
        await notifyReelPending(mediaId, clientId, "resubmitted");
      });
    }

    revalidatePath("/dashboard/reels");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
