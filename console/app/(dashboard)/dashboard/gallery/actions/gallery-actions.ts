"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { messages } from "@/lib/messages";
import { deleteBunnyUrl, isBunnyUrl } from "@modonty/database/lib/bunny";
import { regenerateClientSeo } from "../../profile/actions/regenerate-client-seo";

export interface GalleryImage {
  id: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
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
  /** Locked decision أ (2026-07-07): default ON — the image also becomes a pending image-reel. */
  publishAsReel?: boolean;
}

type AddResult = { success: true; image: GalleryImage } | { success: false; error: string };
type MutResult = { success: true } | { success: false; error: string };

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

/**
 * Persist a client-page gallery image. The file is uploaded client-side straight
 * to Cloudinary (unsigned preset); here we only store the resulting Media row
 * (type=GALLERY, scope=CLIENT) so it flows into the page + Organization.image[]
 * JSON-LD. Returns the created row so the grid can append it without a refetch.
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
        cloudinaryPublicId: input.publicId ?? null,
        altText: (input.altText ?? "").trim() || null,
        clientId,
        scope: "CLIENT",
        type: "GALLERY",
      },
      select: { id: true, url: true, altText: true, width: true, height: true },
    });

    // Unified flow (locked 2026-07-06): same file also becomes an image-reel,
    // gated by admin approval. Best-effort — gallery save must never fail because of it.
    if (input.publishAsReel !== false) {
      try {
        const client = await db.client.findUnique({
          where: { id: clientId },
          select: { name: true },
        });
        const autoTitle = (input.altText ?? "").trim() || client?.name || "ريل";
        await db.reel.create({
          data: {
            clientId,
            slug: `reel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type: "IMAGE",
            imageUrl: url,
            thumbnailUrl: url,
            width: input.width ?? null,
            height: input.height ?? null,
            fileSize: input.fileSize ?? null,
            title: autoTitle.slice(0, 100),
            description: `صورة من معرض ${client?.name ?? ""}`.trim(),
            transcriptStatus: "SKIPPED",
            status: "PENDING_APPROVAL",
            uploadedBy: "CLIENT",
          },
        });
      } catch {
        /* reel creation is best-effort */
      }
    }

    // Gallery feeds Organization.image[] (ImageObject) in the cached JSON-LD.
    try {
      await regenerateClientSeo(clientId);
    } catch {
      /* best-effort — upload must succeed even if SEO regen fails */
    }
    revalidatePath("/dashboard/gallery");
    return { success: true, image: media };
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
      select: { id: true, url: true },
    });
    if (!owned) return { success: false, error: messages.error.notFound };
    // Same-file reels go with the image (source is gone); comments/likes cascade.
    await db.reel.deleteMany({ where: { clientId, imageUrl: owned.url } }).catch(() => {});
    // Bunny-hosted files are deleted immediately; legacy Cloudinary files stay
    // for the orphans maintenance (production-only) as before.
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
