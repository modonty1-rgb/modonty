import { db } from "@/lib/db";

/**
 * Sidebar badges — how many the client HAS, in each of the three media sections.
 *
 * Deliberately a plain count, not "how many need your attention" (which is what this
 * first shipped as, 2026-08-05). Khalid read the zero next to a section that visibly held
 * an image and took it for a bug — and a number whose meaning has to be explained is the
 * wrong number. Whatever needs the client's hand is said in words on the card itself.
 *
 * Counted rather than filtered per-field: in MongoDB an absent key matches neither `null`
 * nor a value, and a clever `where` on those fields would quietly read zero.
 */
export async function getMediaSectionCounts(
  clientId: string
): Promise<{ gallery: number; images: number; videos: number }> {
  const [gallery, images, videos] = await Promise.all([
    db.media.count({ where: { clientId, inGallery: true, type: "GALLERY" } }),
    db.media.count({
      where: {
        clientId,
        inReels: true,
        reelStatus: { not: "ARCHIVED" },
        mimeType: { startsWith: "image/" },
      },
    }),
    db.media.count({
      where: {
        clientId,
        inReels: true,
        reelStatus: { not: "ARCHIVED" },
        mimeType: { startsWith: "video/" },
      },
    }),
  ]);
  return { gallery, images, videos };
}
