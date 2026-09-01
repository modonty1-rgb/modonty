"use server";

import { revalidatePath } from "next/cache";

import { bestRendition, getStreamVideo, streamUrls } from "@modonty/shared/lib/bunny-stream";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * Refill a video reel's duration and dimensions from Bunny.
 *
 * `finalizeVideoReel` in the console writes these from the browser after the upload, and
 * every failure path there leaves the row without them — a dropped connection, a failed
 * encode, or simply the client closing the tab. Bunny measured the file itself while
 * encoding it, so in the common case (the bytes arrived, the browser did not report back)
 * the data is one request away and nobody needs to re-upload anything.
 *
 * This is the admin's move, not the client's: the client is not technical, and the upload
 * they saw finish looks finished to them. Khalid, 25 Aug 2026 — the admin sees the problem
 * and explains it, so the admin also gets the button that fixes what can be fixed.
 *
 * When Bunny has nothing either, the file genuinely is not there and the reel has to be
 * uploaded again — that is what the returned error says.
 */
export async function repairReelMedia(
  mediaId: string,
): Promise<{ success: true; durationSec: number } | { success: false; error: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرّح" };

  const reel = await db.media.findFirst({
    where: { id: mediaId, inReels: true },
    select: { id: true, bunnyVideoId: true, mimeType: true },
  });
  if (!reel) return { success: false, error: "الريل غير موجود" };
  if (!reel.mimeType?.startsWith("video/")) {
    return { success: false, error: "هذا مو مقطع فيديو — الصور ما لها مدّة" };
  }
  if (!reel.bunnyVideoId) {
    return { success: false, error: "الريل ما عنده معرّف على بني — لازم يترفع من جديد" };
  }

  const state = await getStreamVideo(reel.bunnyVideoId).catch(() => null);
  if (!state) {
    return { success: false, error: "بني ما يعرف هذا المقطع — الملف مو موجود، لازم يترفع من جديد" };
  }
  // Status 5 is Bunny's own "failed"; a zero length means it never finished encoding, so
  // there is nothing playable behind the row no matter what the database says.
  if (state.status === 5 || state.length <= 0) {
    return { success: false, error: "بني ما قدر يعالج المقطع — لازم يترفع من جديد" };
  }

  // The MP4 URL was written as `play_720p.mp4` before encoding, when the rendition set was
  // unknown. Point it at one Bunny actually produced — it encodes down only, so a 480p
  // source has no 720p file and that URL is a 404 for the player and for Google alike.
  const best = bestRendition(state.availableResolutions);
  const urls = best ? streamUrls(reel.bunnyVideoId, best) : null;

  await db.media.update({
    where: { id: reel.id },
    data: {
      durationSec: Math.round(state.length),
      width: state.width || null,
      height: state.height || null,
      ...(urls ? { mp4Url: urls.mp4Url, contentUrl: urls.mp4Url, url: urls.mp4Url } : {}),
    },
  });

  revalidatePath("/reels", "layout");
  return { success: true, durationSec: Math.round(state.length) };
}
