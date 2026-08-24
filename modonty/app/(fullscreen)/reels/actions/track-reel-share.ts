"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trackReelShare } from "@/lib/analytics/events-registry";

/**
 * A share happens in the browser — `navigator.share`, or a copy to the clipboard — so unlike
 * the other four reel events there is no server write to hang it on. This action exists only
 * to carry it: GA4's Measurement Protocol call needs the visitor cookie, which lives on the
 * server side of this app.
 *
 * `platform` is what the browser actually did, not what it was asked to do: «native» when the
 * OS sheet opened, «clipboard» when it fell back. The distinction is the whole value of the
 * event — a copied link travels differently from a shared one.
 */
export async function trackReelShareEvent(
  mediaId: string,
  platform: "native" | "clipboard"
): Promise<void> {
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
    if (!reel) return;

    const session = await auth();
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
      { userId: session?.user?.id },
    );
  } catch {
    // A lost analytics event must never surface to the reader.
  }
}
