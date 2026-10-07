"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { getSessionClientId } from "@/lib/get-session-client-id";
import { db } from "@/lib/db";
import { buildReelSlug } from "@/lib/build-reel-slug";
import { messages } from "@/lib/messages";

import { notifyReelPending } from "@/lib/notify-reel-pending";

/**
 * The client's own reels section — independent of the gallery (Khalid 2026-08-04).
 *
 * The gallery tick turns an image that already lives on the client's page into a reel as
 * well. Here the client makes a reel on purpose: it is not a page image, it exists only
 * as a reel. Both are the same kind of row now (2026-08-05) — a media file with
 * `inReels` on — and both land in the same approval queue.
 *
 * Which of the two it is reads off `inGallery`, not a link field: a reel that also shows
 * in the gallery is managed from the gallery tick, and cannot be deleted from here.
 *
 * Nothing here publishes anything. Every row starts at PENDING_APPROVAL — the promise
 * shown to the client is "بعد اعتماد مُدَوَّنَتِي", and this is the code that keeps it.
 */

type Result = { success: true } | { success: false; error: string };

interface CreateImageReelInput {
  url: string;
  /** The uploaded file's own name — stored as the filename, never reused as the title. */
  filename: string;
  description?: string | null;
  /** The type of what was actually stored, not of what the client picked: the uploader
   *  converts to WebP, and the row used to keep saying "image/jpeg" about a `.webp` file. */
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  fileSize?: number | null;
  /** Tiny inline placeholder computed by the upload route — dropped on the floor until now. */
  blurDataURL?: string | null;
}

/**
 * Create a standalone image reel — one the client made deliberately, not a page image.
 *
 * The reel lands with NO title on purpose. It used to be seeded from the file name, which
 * gave every reel a title like "IMG_2381" — and Google requires a title unique to each
 * one. The client writes it on the card, and approval is blocked until then (ق9).
 */
export async function createImageReel(input: CreateImageReelInput): Promise<Result> {
  const clientId = await getSessionClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const url = (input.url ?? "").trim();
  if (!url.startsWith("http")) return { success: false, error: messages.error.serverError };

  try {
    const created = await db.media.create({
      select: { id: true },
      data: {
        filename: (input.filename ?? "").trim().slice(0, 200) || "reel",
        url,
        contentUrl: url,
        thumbnailUrl: url,
        mimeType: input.mimeType ?? "image/webp",
        fileSize: input.fileSize ?? null,
        width: input.width ?? null,
        height: input.height ?? null,
        blurDataURL: input.blurDataURL ?? null,
        clientId,
        scope: "CLIENT",
        // Not a page image — it never appears in the gallery, only in the reels feed.
        type: "GENERAL",
        inGallery: false,
        inReels: true,
        // Left empty on purpose when the client wrote nothing. Google wants a description
        // unique to each reel, and a generated one ("ريل من <العميل>") is identical on
        // every row — the approval guard blocks the reel until a real one is written.
        description: (input.description ?? "").trim().slice(0, 500) || null,
        reelSlug: await buildReelSlug(),
        reelStatus: "PENDING_APPROVAL",
        reelUploadedBy: "CLIENT",
        transcriptStatus: "SKIPPED",
      },
    });

    // Registered inside the request — a bare unawaited promise here dies when the response
    // closes, which is the exact failure OBS-216 traced on the GA4 events.
    after(async () => {
      await notifyReelPending(created.id, clientId, "uploaded");
    });

    revalidatePath("/dashboard/reels");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
