"use server";

import { getSessionClientId } from "@/lib/get-session-client-id";
import { db } from "@/lib/db";
import { buildReelSlug } from "@/lib/build-reel-slug";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { messages } from "@/lib/messages";
import { notifyReelPending } from "@/lib/notify-reel-pending";
import type { Result } from "../result";

/**
 * Turn "show this image in reels" on or off — AFTER upload, any time.
 *
 * The old flow decided this once, before uploading, for the whole batch and never again
 * (Khalid 2026-08-04: "لو حب أعرضها في الـ Reels تكون اختيارية… على كل صورة").
 *
 * Turning it OFF is deliberately not a blanket delete: a reel that was already approved
 * or published may carry real visitors' comments and likes, so it is archived instead —
 * it leaves the feed, the engagement survives, and re-ticking brings it back. Only a reel
 * nobody has seen yet (draft, waiting, rejected) is actually removed.
 */
export async function setImageInReels(
  mediaId: string,
  enabled: boolean
): Promise<Result> {
  const clientId = await getSessionClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const media = await db.media.findFirst({
      where: { id: mediaId, clientId, type: "GALLERY" },
      select: {
        id: true,
        title: true,
        altText: true,
        reelSlug: true,
        reelStatus: true,
      },
    });
    if (!media) return { success: false, error: messages.error.notFound };

    if (enabled) {
      // Google wants a title unique to each reel. Seeding it from the client's name — as
      // this did — gave every reel of that client the SAME title, which is the duplicate
      // Modonty then has to reject one by one (ق9). So it is seeded only from something
      // that already describes THIS image, and otherwise left empty: the client writes it
      // on the reels card, and approval is blocked until they do.
      const ownTitle = (media.title ?? media.altText ?? "").trim();
      await db.media.update({
        where: { id: mediaId },
        data: {
          inReels: true,
          // Archived means the client took it out earlier — putting it back re-enters the
          // queue. Anything else keeps whatever the admin already decided about it.
          ...(media.reelStatus == null || media.reelStatus === "ARCHIVED"
            ? { reelStatus: "PENDING_APPROVAL" as const, reelUploadedBy: "CLIENT" as const }
            : {}),
          ...(media.reelSlug ? {} : { reelSlug: await buildReelSlug() }),
          ...(media.title || !ownTitle ? {} : { title: ownTitle.slice(0, 100) }),
        },
      });

      // Ticking a gallery image into the reels queue is an upload as far as the reviewer is
      // concerned — same queue, same waiting client. Only a row that actually entered the
      // queue is announced: re-ticking one the admin already approved changes nothing.
      if (media.reelStatus == null || media.reelStatus === "ARCHIVED") {
        after(async () => {
          await notifyReelPending(mediaId, clientId, "uploaded");
        });
      }
    } else {
      // Turning it off is not a delete. A reel visitors have already seen carries their
      // comments and likes, so it is archived — it leaves the feed, the engagement lives,
      // and re-ticking brings it back. Nothing is destroyed either way: the row IS the image.
      const seenByVisitors =
        media.reelStatus === "APPROVED" || media.reelStatus === "PUBLISHED";
      await db.media.update({
        where: { id: mediaId },
        data: {
          inReels: false,
          reelStatus: seenByVisitors ? "ARCHIVED" : null,
        },
      });
    }

    revalidatePath("/dashboard/gallery");
    // The same image is a card on the reels page — its tick lives there too.
    revalidatePath("/dashboard/reels");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
