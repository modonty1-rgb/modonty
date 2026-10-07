"use server";

import { revalidatePath } from "next/cache";

import { getSessionClientId } from "@/lib/get-session-client-id";
import { db } from "@/lib/db";
import { buildReelSlug } from "@/lib/build-reel-slug";
import { messages } from "@/lib/messages";
import { discardVideo } from "@/lib/reels/discard-video";
import {
  bestRendition,
  createTusTicket,
  getStreamVideo,
  streamUrls,
} from "@modonty/shared/lib/bunny-stream";

/**
 * Video reels — upload and finish (ق2 + ق7, 2026-08-05).
 *
 * The file itself never touches our server. This mints a one-video signature, records the
 * row immediately so a client who closes the tab mid-upload still sees the reel waiting
 * for them, and then fills in what the browser measured once the bytes are through.
 *
 * Nothing here publishes anything. Every row starts at PENDING_APPROVAL.
 */

type Result = { success: true } | { success: false; error: string };

/** ق7: 90 seconds is the locked ceiling — enforced in the browser AND again here. */
const MAX_DURATION_SEC = 90;
const MIN_DURATION_SEC = 2;

interface VideoUploadTicket {
  mediaId: string;
  endpoint: string;
  libraryId: string;
  videoId: string;
  signature: string;
  expire: number;
}

/**
 * Step 1 — reserve a video on Bunny and a row here, and hand the browser a signature.
 *
 * The row is created BEFORE the upload on purpose: the guid is the only handle we have on
 * the file, and a browser that dies mid-upload would otherwise leave a paid-for video in
 * the library that nothing in our database knows about.
 */
export async function createVideoUploadTicket(
  filename: string
): Promise<{ success: true; ticket: VideoUploadTicket } | { success: false; error: string }> {
  const clientId = await getSessionClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    // Bunny wants a title on the video object; ours is a placeholder the client replaces.
    // It is the library's label, not the reel's — the reel's title stays empty until
    // written, because Google needs it unique per video (ق9).
    const ticket = await createTusTicket(filename.slice(0, 200) || "reel");
    const urls = streamUrls(ticket.videoId);

    const media = await db.media.create({
      data: {
        filename: filename.slice(0, 200) || "reel.mp4",
        url: urls.mp4Url,
        contentUrl: urls.mp4Url,
        mimeType: "video/mp4",
        clientId,
        scope: "CLIENT",
        type: "GENERAL",
        // A video is never a page image — it exists only as a reel.
        inGallery: false,
        inReels: true,
        bunnyVideoId: ticket.videoId,
        playbackUrl: urls.playbackUrl,
        mp4Url: urls.mp4Url,
        thumbnailUrl: urls.thumbnailUrl,
        reelSlug: await buildReelSlug(),
        reelStatus: "PENDING_APPROVAL",
        reelUploadedBy: "CLIENT",
        transcriptStatus: "PENDING",
      },
      select: { id: true },
    });

    return { success: true, ticket: { mediaId: media.id, ...ticket } };
  } catch {
    return { success: false, error: "ما قدرنا نجهّز الرفع — جرّب مرة ثانية" };
  }
}

interface FinalizeVideoInput {
  durationSec: number;
  width: number;
  height: number;
  fileSize: number;
}

/**
 * Step 2 — the bytes are through. Store what the file actually is.
 *
 * The duration is re-checked here even though the browser already refused anything longer:
 * the browser check is for the client's benefit (it saves them a pointless upload), this
 * one is the rule. A clip that slips past it is rejected and its Bunny video removed.
 */
export async function finalizeVideoReel(
  mediaId: string,
  input: FinalizeVideoInput
): Promise<Result> {
  const clientId = await getSessionClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const owned = await db.media.findFirst({
      where: { id: mediaId, clientId, inReels: true },
      select: { id: true, bunnyVideoId: true },
    });
    if (!owned) return { success: false, error: messages.error.notFound };

    const duration = Math.round(input.durationSec);
    if (duration > MAX_DURATION_SEC || duration < MIN_DURATION_SEC) {
      await discardVideo(owned.id, owned.bunnyVideoId);
      return {
        success: false,
        error: `المقطع لازم يكون بين ${MIN_DURATION_SEC} و${MAX_DURATION_SEC} ثانية`,
      };
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

    revalidatePath("/dashboard/videos");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

/**
 * Called by the client while the card shows "نجهّز المقطع".
 *
 * Bunny encodes after the upload, and until it finishes there is no playable file and no
 * thumbnail. Status 3 (finished) and 4 (resolution finished) both mean ready; 5 means the
 * encode failed and the reel is unusable.
 */
export async function getVideoEncodingState(
  mediaId: string
): Promise<{ ready: boolean; failed: boolean; progress: number }> {
  const clientId = await getSessionClientId();
  if (!clientId) return { ready: false, failed: false, progress: 0 };

  const media = await db.media.findFirst({
    where: { id: mediaId, clientId },
    select: { bunnyVideoId: true },
  });
  if (!media?.bunnyVideoId) return { ready: false, failed: false, progress: 0 };

  const state = await getStreamVideo(media.bunnyVideoId);
  if (!state) return { ready: false, failed: false, progress: 0 };

  const ready = state.status === 3 || state.status === 4;
  if (ready) {
    // The row was written with the default 720p MP4 before a byte went out, because the
    // renditions are only known once Bunny has encoded. Bunny encodes DOWN from the source
    // and never up, so a 480p upload produces no 720p file at all — and `play_720p.mp4`
    // would 404 for both the feed's player and the `contentUrl` Google fetches to verify
    // the clip. Now that the real set is known, point at the best one that exists.
    const best = bestRendition(state.availableResolutions);
    if (best) {
      const urls = streamUrls(media.bunnyVideoId, best);
      await db.media.update({
        where: { id: mediaId },
        data: { mp4Url: urls.mp4Url, contentUrl: urls.mp4Url, url: urls.mp4Url },
      });
    }
    revalidatePath("/dashboard/videos");
  }
  return { ready, failed: state.status === 5, progress: state.encodeProgress };
}
