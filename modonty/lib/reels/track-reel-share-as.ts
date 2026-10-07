import "server-only";

import { db } from "@/lib/db";
import { trackReelShare } from "@/lib/analytics/events-registry";

/**
 * A reel share for a known (or anonymous) reader — the body of `trackReelShareEvent` with the
 * identity passed in. The share itself happens on the device (`navigator.share` / clipboard on the
 * web, the OS sheet in the app); this only carries the GA4 event. `platform` is what actually
 * happened: «native» when the OS sheet opened, «clipboard» when it fell back.
 * Returns whether the reel exists; never throws — a lost analytics event must not surface.
 */
export async function trackReelShareAs(
  userId: string | undefined,
  mediaId: string,
  platform: "native" | "clipboard"
): Promise<"tracked" | "not_found" | "failed"> {
  try {
    const reel = await db.media.findFirst({
      where: { id: mediaId, inReels: true, reelStatus: "PUBLISHED" },
      select: {
        id: true,
        reelSlug: true,
        bunnyVideoId: true,
        client: { select: { id: true, slug: true, name: true } },
      },
    });
    if (!reel) return "not_found";

    await trackReelShare(
      {
        reel_id: reel.id,
        reel_slug: reel.reelSlug ?? reel.id,
        reel_kind: reel.bunnyVideoId ? "video" : "image",
        share_platform: platform,
        client_id: reel.client?.id,
        client_slug: reel.client?.slug,
        client_name: reel.client?.name,
      },
      { userId },
    );
    return "tracked";
  } catch (error) {
    // A lost analytics event must never surface to the reader — logged, not thrown.
    console.error("[trackReelShareAs]", error);
    return "failed";
  }
}
