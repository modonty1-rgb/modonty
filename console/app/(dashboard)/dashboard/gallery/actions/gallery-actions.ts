"use server";

import { getSessionClientId } from "@/lib/get-session-client-id";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { messages } from "@/lib/messages";
import { deleteBunnyUrl } from "@modonty/shared/lib/bunny";
import { isOwnBunnyUrl } from "@/lib/bunny/is-own-bunny-url";
import { regenerateClientSeo } from "@/lib/regenerate-client-seo";
import { setImageInReels } from "@/lib/reels/actions/set-image-in-reels";

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

interface AddGalleryInput {
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
  const clientId = await getSessionClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const url = (input.url ?? "").trim();
  // Only a file this partner uploaded (/api/upload-bunny → clients/<id>/…). Any url used to pass,
  // and the delete below would then erase another partner's file (security fix, 4 Oct 2026).
  if (!isOwnBunnyUrl(url, clientId)) return { success: false, error: messages.error.unauthorized };

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
  const clientId = await getSessionClientId();
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
  const clientId = await getSessionClientId();
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
    // Only ever delete from this partner's own folder — never a file another partner owns.
    if (isOwnBunnyUrl(owned.url, clientId)) {
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
