"use server";

import { db } from "@/lib/db";
import { incrementCounters } from "@/lib/counters/increment-counters";
import { fireClientEvent } from "@modonty/shared/lib/mobile-push";

export interface ReelViewGa4Params {
  reel_id: string;
  reel_slug: string;
  reel_kind: "video" | "image";
  client_id?: string;
  client_slug?: string;
  client_name?: string;
}

/**
 * One more view on a reel's cached counter — fired by the client after the reel has held
 * the screen for two seconds, once per reel per browser session (the dedupe lives in
 * sessionStorage on the caller's side; see helpers/mark-reel-viewed.ts).
 *
 * Deliberately a bare counter, not the article view pipeline: articles write ArticleView +
 * Analytics rows with geo and traffic source, tables that have no Media equivalent — adding
 * them is a schema change that belongs to its own decision. `updateMany` doubles as the
 * guard: an id that is not a published reel updates zero rows.
 *
 * No cache invalidation on purpose — the only public reader is the watch page's
 * VideoObject counter, and an hour-old view count is fine for it (its cache moved minutes → hours,
 * 2 Oct 2026; likes/saves still bust it at once via updateTag).
 *
 * Returns the GA4 params for the caller to push from the browser, or null when nothing counted.
 */
export async function trackReelView(mediaId: string): Promise<ReelViewGa4Params | null> {
  try {
    // Read before the increment: the same row carries what GA4 needs, so the event costs no
    // second query. `updateMany` cannot return the row, hence the explicit find.
    const reel = await db.media.findFirst({
      where: { id: mediaId, inReels: true, reelStatus: "PUBLISHED" },
      select: {
        id: true,
        reelSlug: true,
        bunnyVideoId: true,
        client: { select: { id: true, slug: true, name: true } },
      },
    });
    if (!reel) return null;

    // Atomic `$inc` outside a transaction — see incrementCounters (write conflicts under load).
    await incrementCounters("media", reel.id, { viewsCount: 1 });
    fireClientEvent(reel.client?.id, { kind: "reel_view", mediaId: reel.id });

    // The counter is modonty's own; the event is what GA4 reports on. Both fire on the same
    // 2-second hold, so «مشاهدة» means one thing in both places. The caller pushes it from the
    // browser — a server-sent event became a phantom GA4 session (lib/analytics/ga4-browser.ts).
    return {
      reel_id: reel.id,
      reel_slug: reel.reelSlug ?? reel.id,
      reel_kind: reel.bunnyVideoId ? "video" : "image",
      client_id: reel.client?.id,
      client_slug: reel.client?.slug,
      client_name: reel.client?.name,
    };
  } catch {
    // A lost view increment is not worth surfacing to the viewer.
    return null;
  }
}
