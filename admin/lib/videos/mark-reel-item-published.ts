import "server-only";

import { db } from "@/lib/db";
import { jobStatusFromItems } from "./job-status-from-items";

/**
 * ريل اعتمده الفريق من طابور الريلز ← بنده في فيديو المصنع يصير «منشور». البند يحمل معرّف صف الـMedia
 * في `externalId` منذ لحظة اعتماده للريلز (`createReelFromShort`). صفٌّ لا ينتمي لأي فيديو ← لا شيء.
 */
export async function markReelItemPublished(mediaId: string, reelUrl: string | null): Promise<void> {
  const job = await db.videoJob.findFirst({
    where: { items: { some: { platform: "MODONTY_REELS", externalId: mediaId } } },
    select: { id: true, revision: true, status: true, items: true },
  });
  if (!job) return;
  const now = new Date();
  const items = job.items.map((i) =>
    i.platform === "MODONTY_REELS" && i.externalId === mediaId ? { ...i, status: "PUBLISHED" as const, url: reelUrl, error: null, updatedAt: now } : i,
  );
  const next = jobStatusFromItems(items);
  await db.videoJob.update({
    where: { id: job.id },
    data: {
      items: { set: items },
      status: job.status === "NEEDS_ATTENTION" && next !== "DONE" ? "NEEDS_ATTENTION" : next,
      history: { push: { revision: job.revision, event: "reel_published", at: now, byName: null } },
    },
  });
}
