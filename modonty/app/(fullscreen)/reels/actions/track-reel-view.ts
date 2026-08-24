"use server";

import { db } from "@/lib/db";
import { trackReelViewEvent } from "@/lib/analytics/events-registry";

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
 * VideoObject counter, and its "minutes" cache life is fresher than a view count needs.
 */
export async function trackReelView(mediaId: string): Promise<void> {
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
    if (!reel) return;

    await db.media.update({
      where: { id: reel.id },
      data: { viewsCount: { increment: 1 } },
    });

    // The counter is modonty's own; the event is what GA4 reports on. Both fire on the same
    // 2-second hold, so «مشاهدة» means one thing in both places.
    void trackReelViewEvent({
      reel_id: reel.id,
      reel_slug: reel.reelSlug ?? reel.id,
      reel_kind: reel.bunnyVideoId ? "video" : "image",
      client_id: reel.client?.id,
      client_slug: reel.client?.slug,
      client_name: reel.client?.name,
    });
  } catch {
    // A lost view increment is not worth surfacing to the viewer.
  }
}
