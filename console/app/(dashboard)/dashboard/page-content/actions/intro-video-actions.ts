"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages } from "@/lib/messages";
import { regenerateClientSeo } from "../../profile/actions/regenerate-client-seo";
import {
  createTusTicket,
  deleteStreamVideo,
  getStreamVideo,
  streamUrls,
} from "@modonty/database/lib/bunny-stream";

/**
 * The client's intro video — hosted by us, not by YouTube (Khalid 2026-08-05).
 *
 * What this replaces: a free-text link field. Five clients had one, and the links were on
 * channels they do not own — so Google credited the video to somebody else, the client
 * could neither edit nor delete it, and two of the five did not play at all (a Facebook
 * share link and a Google Drive "view" page, neither of which is a video file).
 *
 * This is page content, not a reel: it shows in the "من نحن" section of the client's own
 * page, so it follows the gallery's rules — the client owns it and no approval gates it —
 * rather than the reels queue.
 *
 * The old link is deliberately NOT deleted up front. It keeps playing until its
 * replacement finishes uploading, and is cleared in the same write that links the new one.
 */

type Result = { success: true } | { success: false; error: string };

/** An "about us" video is not a 90-second reel — five minutes is the ceiling here. */
const MAX_DURATION_SEC = 300;
const MIN_DURATION_SEC = 2;

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

/**
 * Push the change out to the public page.
 *
 * The client page serves STORED structured data, not data generated per request, so a
 * video that never triggers a rebuild is a video Google never learns about. The regen
 * also busts modonty's cache, so this one call is the whole trip.
 *
 * Best-effort by design: the video is already saved, and a failure here must never
 * turn a successful write into an error the client sees.
 */
async function publishToClientPage(clientId: string): Promise<void> {
  try {
    await regenerateClientSeo(clientId);
  } catch {
    // swallow — the write succeeded; refreshing the public page is best-effort
  }
}

export interface IntroVideoTicket {
  mediaId: string;
  endpoint: string;
  libraryId: string;
  videoId: string;
  signature: string;
  expire: number;
}

/**
 * Step 1 — reserve the video on Bunny and the row here, and sign this one upload.
 *
 * The row is written before the bytes move: the guid is our only handle on the file, and
 * a browser that dies mid-upload would otherwise leave a video in the library that nothing
 * in our database knows about. It is NOT linked to the client yet — an unfinished upload
 * must never become the page's intro video.
 */
export async function createIntroVideoTicket(
  filename: string
): Promise<{ success: true; ticket: IntroVideoTicket } | { success: false; error: string }> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const ticket = await createTusTicket(filename.slice(0, 200) || "intro");
    const urls = streamUrls(ticket.videoId);

    const media = await db.media.create({
      data: {
        filename: filename.slice(0, 200) || "intro.mp4",
        url: urls.mp4Url,
        contentUrl: urls.mp4Url,
        mimeType: "video/mp4",
        clientId,
        scope: "CLIENT",
        type: "GENERAL",
        // Neither a gallery image nor a reel — it belongs to the page's About section.
        inGallery: false,
        inReels: false,
        bunnyVideoId: ticket.videoId,
        playbackUrl: urls.playbackUrl,
        mp4Url: urls.mp4Url,
        thumbnailUrl: urls.thumbnailUrl,
      },
      select: { id: true },
    });

    return { success: true, ticket: { mediaId: media.id, ...ticket } };
  } catch {
    return { success: false, error: "ما قدرنا نجهّز الرفع — جرّب مرة ثانية" };
  }
}

export interface FinalizeIntroVideoInput {
  durationSec: number;
  width: number;
  height: number;
  fileSize: number;
}

/**
 * Step 2 — the bytes are through: store what the file is, make it the page's intro video,
 * and retire whatever external link was there.
 *
 * The duration is re-checked even though the browser already refused anything longer. The
 * browser check saves the client a pointless upload; this one is the rule.
 */
export async function finalizeIntroVideo(
  mediaId: string,
  input: FinalizeIntroVideoInput
): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const media = await db.media.findFirst({
      where: { id: mediaId, clientId },
      select: { id: true, bunnyVideoId: true },
    });
    if (!media) return { success: false, error: messages.error.notFound };

    const duration = Math.round(input.durationSec);
    if (duration > MAX_DURATION_SEC || duration < MIN_DURATION_SEC) {
      if (media.bunnyVideoId) await deleteStreamVideo(media.bunnyVideoId);
      await db.media.delete({ where: { id: mediaId } });
      return { success: false, error: `المقطع لازم يكون تحت ${MAX_DURATION_SEC / 60} دقائق` };
    }

    await db.media.update({
      where: { id: mediaId },
      data: {
        durationSec: duration,
        width: input.width || null,
        height: input.height || null,
        fileSize: input.fileSize || null,
      },
    });

    // One write: the new video becomes the page's, and the external link stops being read.
    // Doing it here rather than at upload time is what keeps the old video playing
    // throughout — the page never goes dark during the swap.
    await db.client.update({
      where: { id: clientId },
      data: { introVideoMediaId: mediaId, introVideoUrl: null },
    });

    await publishToClientPage(clientId);
    revalidatePath("/dashboard/page-content");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

/**
 * The title and description Google requires (ق9, same rule as a reel).
 *
 * Without a title there is no VideoObject at all — the generator skips a video that
 * cannot be described rather than emit a node with missing fields. So this is not
 * decoration: it is the difference between the video counting for the client's search
 * results and counting for nothing.
 */
export async function updateIntroVideoDetails(
  title: string,
  description: string
): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const cleanTitle = title.trim();
  if (!cleanTitle) return { success: false, error: "العنوان ما يصير فاضي" };

  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { introVideoMediaId: true },
    });
    if (!client?.introVideoMediaId) return { success: false, error: messages.error.notFound };

    await db.media.update({
      where: { id: client.introVideoMediaId },
      data: {
        title: cleanTitle.slice(0, 100),
        description: description.trim().slice(0, 500) || null,
      },
    });

    await publishToClientPage(clientId);
    revalidatePath("/dashboard/page-content");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

/** Polled by the upload card while Bunny encodes. 3/4 = ready, 5 = the encode failed. */
export async function getIntroVideoEncodingState(
  mediaId: string
): Promise<{ ready: boolean; failed: boolean; progress: number }> {
  const clientId = await getClientId();
  if (!clientId) return { ready: false, failed: false, progress: 0 };

  const media = await db.media.findFirst({
    where: { id: mediaId, clientId },
    select: { bunnyVideoId: true },
  });
  if (!media?.bunnyVideoId) return { ready: false, failed: false, progress: 0 };

  const state = await getStreamVideo(media.bunnyVideoId);
  if (!state) return { ready: false, failed: false, progress: 0 };

  const ready = state.status === 3 || state.status === 4;
  if (ready) revalidatePath("/dashboard/page-content");
  return { ready, failed: state.status === 5, progress: state.encodeProgress };
}

/**
 * Remove the intro video — from the page, from our database, and from Bunny.
 *
 * A real delete here, not an archive: unlike a reel, nothing hangs off this row. Leaving
 * the file on Bunny would mean paying to store something nothing can reach.
 */
export async function removeIntroVideo(): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { introVideoMediaId: true },
    });
    const mediaId = client?.introVideoMediaId;
    if (!mediaId) return { success: false, error: messages.error.notFound };

    const media = await db.media.findUnique({
      where: { id: mediaId },
      select: { bunnyVideoId: true },
    });

    await db.client.update({
      where: { id: clientId },
      data: { introVideoMediaId: null },
    });
    if (media?.bunnyVideoId) await deleteStreamVideo(media.bunnyVideoId);
    await db.media.delete({ where: { id: mediaId } });

    await publishToClientPage(clientId);
    revalidatePath("/dashboard/page-content");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
