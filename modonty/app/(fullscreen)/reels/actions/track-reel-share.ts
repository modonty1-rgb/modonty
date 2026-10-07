"use server";

import { auth } from "@/lib/auth";
import { trackReelShareAs } from "@/lib/reels/track-reel-share-as";

/**
 * A share happens in the browser — `navigator.share`, or a copy to the clipboard — so unlike
 * the other four reel events there is no server write to hang it on. This action exists only
 * to carry it: GA4's Measurement Protocol call needs the visitor cookie, which lives on the
 * server side of this app.
 *
 * `platform` is what the browser actually did, not what it was asked to do: «native» when the
 * OS sheet opened, «clipboard» when it fell back. The distinction is the whole value of the
 * event — a copied link travels differently from a shared one.
 *
 * Web door: identity from the session cookie, logic in `trackReelShareAs` (shared with the mobile API).
 */
export async function trackReelShareEvent(
  mediaId: string,
  platform: "native" | "clipboard"
): Promise<void> {
  try {
    const session = await auth();
    await trackReelShareAs(session?.user?.id, mediaId, platform);
  } catch (error) {
    // A lost analytics event must never surface to the reader.
    console.error("[trackReelShareEvent]", error);
  }
}
