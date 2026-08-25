"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages } from "@/lib/messages";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import {
  bestRendition,
  createTusTicket,
  deleteStreamVideo,
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

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

/** Unique across the media collection — checked in code, not by a nullable-column index. */
async function buildReelSlug(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `reel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const taken = await db.media.findFirst({ where: { reelSlug: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  throw new Error("could not allocate a unique reel slug");
}

export interface VideoUploadTicket {
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
  const clientId = await getClientId();
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

export interface FinalizeVideoInput {
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
  const clientId = await getClientId();
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

/** Drop both sides at once — the row here and the file on Bunny. */
async function discardVideo(mediaId: string, bunnyVideoId: string | null) {
  if (bunnyVideoId) await deleteStreamVideo(bunnyVideoId);
  await db.media.delete({ where: { id: mediaId } });
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

/**
 * Replace the cover (ق9 — the third field the client owns for a video).
 *
 * Bunny extracts a frame automatically, and that frame is sometimes a blink or a blur.
 * The cover is the first thing a visitor sees and the `thumbnailUrl` Google requires, so
 * the client can override it with a still of their own — uploaded through the ordinary
 * image route into the reels zone, exactly like a picture reel.
 */
export async function setVideoCover(mediaId: string, url: string): Promise<Result> {
  const clientId = await getClientId();
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

/**
 * Remove a video reel. Same archive-vs-delete rule as an image reel, with one addition:
 * a real delete has to take the file off Bunny too, or we keep paying for storage nobody
 * can reach.
 */
export async function removeVideoReel(mediaId: string): Promise<Result> {
  const clientId = await getClientId();
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
