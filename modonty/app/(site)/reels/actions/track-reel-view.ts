"use server";

import { db } from "@/lib/db";

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
    await db.media.updateMany({
      where: { id: mediaId, inReels: true, reelStatus: "PUBLISHED" },
      data: { viewsCount: { increment: 1 } },
    });
  } catch {
    // A lost view increment is not worth surfacing to the viewer.
  }
}
