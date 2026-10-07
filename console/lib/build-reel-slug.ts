import { db } from "@/lib/db";

/**
 * A slug for the reel's standalone watch page, unique across the media collection.
 *
 * Checked here rather than by a database index: a unique index on a nullable column
 * would reject the second file that has no slug at all, and most files never get one.
 */
export async function buildReelSlug(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `reel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const taken = await db.media.findFirst({ where: { reelSlug: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  throw new Error("could not allocate a unique reel slug");
}
