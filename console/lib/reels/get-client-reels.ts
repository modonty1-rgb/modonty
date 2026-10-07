import { db } from "@/lib/db";

import type { ClientReel } from "./client-reel";

/**
 * One query behind two console pages (ق8, 2026-08-05).
 *
 * The client gets a route for images and a route for videos, because the two upload
 * experiences have nothing in common — a picture is picked and gone in a second, a clip
 * is a resumable upload, an encoding wait, a cover and a written description.
 *
 * The split is presentation only: both routes read the SAME rows — a media file with
 * `inReels` on — and part on `mimeType`. Nothing in the database knows about it, and the
 * public watch page on modonty.com stays one stable URL regardless.
 */
type ReelKind = "image" | "video";

const PAGE_LIMIT = 60;


export async function getClientReels(
  clientId: string,
  kind: ReelKind
): Promise<ClientReel[]> {
  const rows = await db.media.findMany({
    where: {
      clientId,
      inReels: true,
      reelStatus: { not: "ARCHIVED" },
      mimeType: { startsWith: kind === "video" ? "video/" : "image/" },
    },
    select: {
      id: true,
      url: true,
      bunnyUrl: true,
      blurDataURL: true,
      mimeType: true,
      thumbnailUrl: true,
      mp4Url: true,
      title: true,
      description: true,
      altText: true,
      reelStatus: true,
      reelRejectionReason: true,
      width: true,
      height: true,
      inGallery: true,
      viewsCount: true,
      likesCount: true,
      commentsCount: true,
      favoritesCount: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_LIMIT,
  });

  return rows.map((r) => ({
    id: r.id,
    isVideo: r.mimeType.startsWith("video/"),
    url: r.url,
    bunnyUrl: r.bunnyUrl,
    blurDataURL: r.blurDataURL,
    thumbnailUrl: r.thumbnailUrl,
    mp4Url: r.mp4Url,
    title: r.title,
    description: r.description,
    altText: r.altText,
    status: r.reelStatus,
    rejectionReason: r.reelRejectionReason,
    width: r.width,
    height: r.height,
    inGallery: r.inGallery,
    views: r.viewsCount,
    likes: r.likesCount,
    comments: r.commentsCount,
    favorites: r.favoritesCount,
    createdAt: r.createdAt,
  }));
}
