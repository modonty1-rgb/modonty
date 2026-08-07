"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { messages } from "@/lib/messages";
import { deleteBunnyUrl, isBunnyUrl } from "@modonty/database/lib/bunny";
import { regenerateClientSeo } from "../../profile/actions/regenerate-client-seo";
import { notifyReelPending } from "../../reels/actions/notify-reel-pending";

export interface GalleryImage {
  id: string;
  url: string;
  /** Required key (value may be null) — declaring it optional silently erased the Bunny copy. */
  bunnyUrl: string | null;
  blurDataURL: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  /** The reel switch and its state live on this same row now (2026-08-05). */
  inReels: boolean;
  reelStatus: string | null;
}

export interface AddGalleryInput {
  url: string;
  publicId?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  fileSize?: number | null;
  altText?: string | null;
  /** Blur placeholder built server-side in `/api/upload-bunny` — see `lib/media/generate-blur`. */
  blurDataURL?: string | null;
  /**
   * Opt-in per image (Khalid 2026-08-04). Was "default ON for the whole upload" — the
   * decision that produced 56 unrequested reels. Now only an explicit `true` creates one.
   */
  publishAsReel?: boolean;
}

type AddResult = { success: true; image: GalleryImage } | { success: false; error: string };
type MutResult = { success: true } | { success: false; error: string };

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

/**
 * A slug for the reel's standalone watch page, unique across the media collection.
 *
 * Checked here rather than by a database index: a unique index on a nullable column
 * would reject the second file that has no slug at all, and most files never get one.
 */
async function buildReelSlug(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `reel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const taken = await db.media.findFirst({ where: { reelSlug: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  throw new Error("could not allocate a unique reel slug");
}

/**
 * Persist a client-page gallery image. The bytes go through `/api/upload-bunny`
 * (server-side proxy → Bunny reels zone); here we only store the resulting Media row
 * (type=GALLERY, scope=CLIENT) so it flows into the page + Organization.image[]
 * JSON-LD. Returns the created row so the grid can append it without a refetch.
 *
 * (The old comment claimed a client-side unsigned Cloudinary upload — that stopped being
 * true when the upload moved to Bunny, and a stale comment is how bugs get "confirmed".)
 */
export async function addGalleryImage(input: AddGalleryInput): Promise<AddResult> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const url = (input.url ?? "").trim();
  if (!url.startsWith("http")) return { success: false, error: messages.error.serverError };

  try {
    const media = await db.media.create({
      data: {
        filename: (input.filename ?? "gallery-image").slice(0, 200),
        url,
        mimeType: input.mimeType ?? "image/jpeg",
        fileSize: input.fileSize ?? null,
        width: input.width ?? null,
        height: input.height ?? null,
        encodingFormat: input.mimeType ?? null,
        contentUrl: url,
        blurDataURL: input.blurDataURL ?? null,
        cloudinaryPublicId: input.publicId ?? null,
        altText: (input.altText ?? "").trim() || null,
        clientId,
        scope: "CLIENT",
        type: "GALLERY",
        // Uploaded into the gallery, so it shows there. Reels stay off until asked —
        // defaulting them ON is what produced 56 reels nobody had requested.
        inGallery: true,
        inReels: false,
      },
      select: { id: true, url: true, bunnyUrl: true, blurDataURL: true, altText: true, width: true, height: true },
    });

    // Reel membership is OPT-IN per image (Khalid 2026-08-04) and now just a flag on the
    // row we already created — there is no second row to keep in step with this one.
    const asReel = input.publishAsReel === true;
    if (asReel) {
      await setImageInReels(media.id, true);
    }

    // Gallery feeds Organization.image[] (ImageObject) in the cached JSON-LD.
    try {
      await regenerateClientSeo(clientId);
    } catch {
      /* best-effort — upload must succeed even if SEO regen fails */
    }
    revalidatePath("/dashboard/gallery");
    return {
      success: true,
      image: { ...media, inReels: asReel, reelStatus: asReel ? "PENDING_APPROVAL" : null },
    };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function updateGalleryImageAlt(
  mediaId: string,
  altText: string
): Promise<MutResult> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  try {
    const owned = await db.media.findFirst({
      where: { id: mediaId, clientId, type: "GALLERY" },
      select: { id: true },
    });
    if (!owned) return { success: false, error: messages.error.notFound };
    await db.media.update({
      where: { id: mediaId },
      data: { altText: altText.trim() || null },
    });
    try {
      await regenerateClientSeo(clientId);
    } catch {
      /* best-effort */
    }
    revalidatePath("/dashboard/gallery");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function deleteGalleryImage(mediaId: string): Promise<MutResult> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  try {
    const owned = await db.media.findFirst({
      where: { id: mediaId, clientId, type: "GALLERY" },
      select: {
        id: true,
        url: true,
        inReels: true,
        reelStatus: true,
        commentsCount: true,
        likesCount: true,
      },
    });
    if (!owned) return { success: false, error: messages.error.notFound };

    // DELETE GUARD (2026-08-05). One row is now both the gallery image and the reel, so a
    // plain delete would take a live reel and its visitors' comments and likes with it.
    // A reel that is published, or that anyone has interacted with, only leaves the gallery.
    const isLiveReel = owned.inReels && owned.reelStatus === "PUBLISHED";
    const hasEngagement = owned.commentsCount > 0 || owned.likesCount > 0;
    if (isLiveReel || hasEngagement) {
      await db.media.update({ where: { id: mediaId }, data: { inGallery: false } });
      try {
        await regenerateClientSeo(clientId);
      } catch {
        /* best-effort */
      }
      revalidatePath("/dashboard/gallery");
      return { success: true };
    }

    // Nothing depends on it — a real delete. Bunny-hosted files go immediately; legacy
    // Cloudinary files stay for the orphans maintenance (production-only) as before.
    if (isBunnyUrl("reels", owned.url)) {
      await deleteBunnyUrl("reels", owned.url).catch(() => {});
    }
    await db.media.delete({ where: { id: mediaId } });
    try {
      await regenerateClientSeo(clientId);
    } catch {
      /* best-effort */
    }
    revalidatePath("/dashboard/gallery");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

/**
 * Turn "show this image in reels" on or off — AFTER upload, any time.
 *
 * The old flow decided this once, before uploading, for the whole batch and never again
 * (Khalid 2026-08-04: "لو حب أعرضها في الـ Reels تكون اختيارية… على كل صورة").
 *
 * Turning it OFF is deliberately not a blanket delete: a reel that was already approved
 * or published may carry real visitors' comments and likes, so it is archived instead —
 * it leaves the feed, the engagement survives, and re-ticking brings it back. Only a reel
 * nobody has seen yet (draft, waiting, rejected) is actually removed.
 */
export async function setImageInReels(
  mediaId: string,
  enabled: boolean
): Promise<MutResult> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const media = await db.media.findFirst({
      where: { id: mediaId, clientId, type: "GALLERY" },
      select: {
        id: true,
        title: true,
        altText: true,
        reelSlug: true,
        reelStatus: true,
      },
    });
    if (!media) return { success: false, error: messages.error.notFound };

    if (enabled) {
      // Google wants a title unique to each reel. Seeding it from the client's name — as
      // this did — gave every reel of that client the SAME title, which is the duplicate
      // Modonty then has to reject one by one (ق9). So it is seeded only from something
      // that already describes THIS image, and otherwise left empty: the client writes it
      // on the reels card, and approval is blocked until they do.
      const ownTitle = (media.title ?? media.altText ?? "").trim();
      await db.media.update({
        where: { id: mediaId },
        data: {
          inReels: true,
          // Archived means the client took it out earlier — putting it back re-enters the
          // queue. Anything else keeps whatever the admin already decided about it.
          ...(media.reelStatus == null || media.reelStatus === "ARCHIVED"
            ? { reelStatus: "PENDING_APPROVAL" as const, reelUploadedBy: "CLIENT" as const }
            : {}),
          ...(media.reelSlug ? {} : { reelSlug: await buildReelSlug() }),
          ...(media.title || !ownTitle ? {} : { title: ownTitle.slice(0, 100) }),
        },
      });

      // Ticking a gallery image into the reels queue is an upload as far as the reviewer is
      // concerned — same queue, same waiting client. Only a row that actually entered the
      // queue is announced: re-ticking one the admin already approved changes nothing.
      if (media.reelStatus == null || media.reelStatus === "ARCHIVED") {
        after(async () => {
          await notifyReelPending(mediaId, clientId, "uploaded");
        });
      }
    } else {
      // Turning it off is not a delete. A reel visitors have already seen carries their
      // comments and likes, so it is archived — it leaves the feed, the engagement lives,
      // and re-ticking brings it back. Nothing is destroyed either way: the row IS the image.
      const seenByVisitors =
        media.reelStatus === "APPROVED" || media.reelStatus === "PUBLISHED";
      await db.media.update({
        where: { id: mediaId },
        data: {
          inReels: false,
          reelStatus: seenByVisitors ? "ARCHIVED" : null,
        },
      });
    }

    revalidatePath("/dashboard/gallery");
    // The same image is a card on the reels page — its tick lives there too.
    revalidatePath("/dashboard/reels");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
