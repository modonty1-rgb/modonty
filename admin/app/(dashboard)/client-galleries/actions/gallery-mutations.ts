"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { deleteBunnyUrl, isBunnyUrl } from "@modonty/database/lib/bunny";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { generateClientSEO } from "@/app/(dashboard)/clients/actions/clients-actions/generate-client-seo";

// Admin management of a client's gallery. Mirrors the console gallery flow EXCEPT it does
// NOT spawn an image-reel (reels are client-initiated from the console). The file is
// uploaded client-side to Cloudinary; here we only store the Media row (type=GALLERY,
// scope=CLIENT) so it flows into the client page + Organization.image[] JSON-LD.

export interface AddGalleryInput {
  url: string;
  publicId?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  fileSize?: number | null;
  altText?: string | null;
  /** Blur placeholder from the uploader — see `media/actions/generate-blur.ts`. */
  blurDataURL?: string | null;
}

type Result = { success: true } | { success: false; error: string };

export async function addClientGalleryImage(
  clientId: string,
  input: AddGalleryInput,
): Promise<Result> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرّح" };
  if (!clientId?.trim()) return { success: false, error: "معرّف العميل مفقود" };

  const url = (input.url ?? "").trim();
  if (!url.startsWith("http")) return { success: false, error: "رابط الصورة غير صالح" };

  const client = await db.client.findUnique({ where: { id: clientId }, select: { id: true } });
  if (!client) return { success: false, error: "العميل غير موجود" };

  try {
    await db.media.create({
      data: {
        filename: (input.filename ?? "gallery-image").slice(0, 200),
        url,
        mimeType: input.mimeType ?? "image/webp",
        fileSize: input.fileSize ?? null,
        width: input.width ?? null,
        height: input.height ?? null,
        encodingFormat: input.mimeType ?? null,
        contentUrl: url,
        // Bunny-primary uploads: keep bunnyUrl in sync when the url is already a Bunny url.
        bunnyUrl: isBunnyUrl("clients", url) ? url : null,
        blurDataURL: input.blurDataURL ?? null,
        cloudinaryPublicId: input.publicId ?? null,
        altText: (input.altText ?? "").trim() || null,
        clientId,
        scope: "CLIENT",
        type: "GALLERY",
      },
    });

    // Gallery feeds Organization.image[] — regenerate the client's SEO bundle + refresh
    // modonty's cached client surfaces. Best-effort — the upload must not fail on regen.
    await generateClientSEO(clientId).catch(() => {});
    await revalidateModontyTag("clients").catch(() => {});
    revalidatePath(`/client-galleries/${clientId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "فشل حفظ الصورة" };
  }
}

export async function deleteClientGalleryImage(mediaId: string): Promise<Result> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرّح" };
  if (!mediaId?.trim()) return { success: false, error: "معرّف الصورة مفقود" };

  try {
    const media = await db.media.findFirst({
      where: { id: mediaId, type: "GALLERY" },
      select: {
        id: true,
        url: true,
        clientId: true,
        inReels: true,
        reelStatus: true,
        commentsCount: true,
        likesCount: true,
      },
    });
    if (!media) return { success: false, error: "الصورة غير موجودة" };

    // DELETE GUARD (2026-08-05). This row is both the gallery image and the reel now, so
    // deleting it would take a live reel — and the visitor comments and likes hanging off
    // it — with no warning. A published or engaged reel leaves the gallery instead of the
    // database: `inGallery` off, everything else untouched.
    const isLiveReel = media.inReels && media.reelStatus === "PUBLISHED";
    const hasEngagement = media.commentsCount > 0 || media.likesCount > 0;
    if (isLiveReel || hasEngagement) {
      await db.media.update({ where: { id: mediaId }, data: { inGallery: false } });
      if (media.clientId) {
        await generateClientSEO(media.clientId).catch(() => {});
        await revalidateModontyTag("clients").catch(() => {});
        revalidatePath(`/client-galleries/${media.clientId}`);
      }
      return { success: true };
    }

    // Nothing depends on it — a real delete. Bunny-hosted files go immediately; legacy
    // Cloudinary files stay for the orphans maintenance (as in console).
    if (isBunnyUrl("reels", media.url)) {
      await deleteBunnyUrl("reels", media.url).catch(() => {});
    }
    await db.media.delete({ where: { id: mediaId } });

    if (media.clientId) {
      await generateClientSEO(media.clientId).catch(() => {});
      await revalidateModontyTag("clients").catch(() => {});
      revalidatePath(`/client-galleries/${media.clientId}`);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "فشل حذف الصورة" };
  }
}
