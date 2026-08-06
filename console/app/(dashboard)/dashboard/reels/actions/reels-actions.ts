"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages } from "@/lib/messages";

import { notifyReelPending } from "./notify-reel-pending";

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

export interface ClientReel {
  id: string;
  /** Derived from `mimeType` — there is no separate type column any more. */
  isVideo: boolean;
  url: string;
  bunnyUrl: string | null;
  thumbnailUrl: string | null;
  /** Videos only — the plain MP4 the card plays, and the file Google fetches. */
  mp4Url: string | null;
  title: string | null;
  description: string | null;
  /** Image reels only — Google reads it to understand a still picture. */
  altText: string | null;
  status: string | null;
  rejectionReason: string | null;
  width: number | null;
  height: number | null;
  /** Also a gallery image — the client manages it from the gallery tick, not from here. */
  inGallery: boolean;
  /** Cached on the row itself, so the card costs no extra query (ق10). */
  views: number;
  likes: number;
  comments: number;
  favorites: number;
  createdAt: Date;
}

type Result = { success: true } | { success: false; error: string };

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

/**
 * A slug for the reel's standalone watch page, unique across the media collection.
 *
 * Checked here rather than by a database index: a unique index on a nullable column
 * would reject the second file that has no slug at all, and most files never get one.
 */
async function buildReelSlug(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `reel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const taken = await db.media.findFirst({ where: { reelSlug: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  throw new Error("could not allocate a unique reel slug");
}

export interface CreateImageReelInput {
  url: string;
  /** The uploaded file's own name — stored as the filename, never reused as the title. */
  filename: string;
  description?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  fileSize?: number | null;
}

/**
 * Create a standalone image reel — one the client made deliberately, not a page image.
 *
 * The reel lands with NO title on purpose. It used to be seeded from the file name, which
 * gave every reel a title like "IMG_2381" — and Google requires a title unique to each
 * one. The client writes it on the card, and approval is blocked until then (ق9).
 */
export async function createImageReel(input: CreateImageReelInput): Promise<Result> {
  const clientId = await getClientId();
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
        mimeType: input.mimeType ?? "image/jpeg",
        fileSize: input.fileSize ?? null,
        width: input.width ?? null,
        height: input.height ?? null,
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

export interface ReelDetailsInput {
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
  const clientId = await getClientId();
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
  const clientId = await getClientId();
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

    revalidatePath("/dashboard/reels");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
