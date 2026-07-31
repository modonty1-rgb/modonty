"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { MediaType, MediaScope } from "@prisma/client";
import { generateAndSaveJsonLd } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
import { buildBunnyMediaPath, moveBunnyMedia, bunnyAspectUrl, BUNNY_ASPECT_SUFFIX } from "@modonty/database/lib/bunny";

interface UpdateMediaData {
  scope?: MediaScope;
  type?: MediaType;
  altText?: string;
  caption?: string;
  credit?: string;
  title?: string;
  description?: string;
  license?: string;
  creator?: string;
  clientId?: string | null;
  dateCreated?: Date;
  geoLatitude?: number;
  geoLongitude?: number;
  geoLocationName?: string;
  contentLocation?: string;
  cloudinaryPublicId?: string;
  cloudinaryVersion?: string;
  cloudinarySignature?: string;
  url?: string;
  bunnyUrl?: string; // Bunny-primary: replace-file flow must sync this with url
  filename?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  encodingFormat?: string;
}

export async function updateMedia(id: string, data: UpdateMediaData) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    // Changing the media type or its client moves the Bunny file to its new
    // /{type}/{clientSlug}/ folder (P2 critical note). Best-effort — a Bunny
    // failure must NOT block the admin edit; bunnyUrl then keeps its old path.
    let movedBunnyUrl: string | undefined;
    if (data.type !== undefined || data.clientId !== undefined) {
      const current = await db.media.findUnique({
        where: { id },
        select: {
          type: true,
          scope: true,
          clientId: true,
          bunnyUrl: true,
          filename: true,
          cloudinaryPublicId: true,
        },
      });
      const typeChanged = data.type !== undefined && data.type !== current?.type;
      const clientChanged = data.clientId !== undefined && data.clientId !== current?.clientId;
      if (current?.bunnyUrl && (typeChanged || clientChanged)) {
        try {
          const newClientId = data.clientId !== undefined ? data.clientId : current.clientId;
          let newSlug: string | null = null;
          if (newClientId) {
            const client = await db.client.findUnique({
              where: { id: newClientId },
              select: { slug: true },
            });
            newSlug = client?.slug ?? null;
          }
          const newPath = buildBunnyMediaPath({
            type: data.type ?? current.type,
            scope: data.scope ?? current.scope,
            clientSlug: newSlug,
            filename: current.filename,
            publicId: current.cloudinaryPublicId,
          });
          const moved = await moveBunnyMedia("clients", current.bunnyUrl, newPath);
          movedBunnyUrl = moved.url;

          // Article images carry 3 pre-generated aspect crops next to the base —
          // move them too, else the JSON-LD crop URLs 404 at the new folder.
          if ((data.type ?? current.type) === "POST") {
            for (const suffix of Object.values(BUNNY_ASPECT_SUFFIX)) {
              await moveBunnyMedia(
                "clients",
                bunnyAspectUrl(current.bunnyUrl, suffix),
                bunnyAspectUrl(newPath, suffix)
              );
            }
          }
        } catch {
          // Swallow — the metadata edit proceeds; a later repair reconciles the path.
        }
      }
    }

    const media = await db.media.update({
      where: { id },
      data: {
        ...(data.scope !== undefined ? { scope: data.scope } : {}),
        type: data.type,
        altText: data.altText,
        caption: data.caption,
        credit: data.credit,
        title: data.title,
        description: data.description,
        license: data.license,
        creator: data.creator,
        ...(data.clientId !== undefined ? { clientId: data.clientId } : {}),
        dateCreated: data.dateCreated,
        geoLatitude: data.geoLatitude,
        geoLongitude: data.geoLongitude,
        geoLocationName: data.geoLocationName,
        contentLocation: data.contentLocation,
        cloudinaryPublicId: data.cloudinaryPublicId,
        cloudinaryVersion: data.cloudinaryVersion,
        cloudinarySignature: data.cloudinarySignature,
        ...(data.url !== undefined ? { url: data.url } : {}),
        ...(data.bunnyUrl !== undefined ? { bunnyUrl: data.bunnyUrl } : {}),
        ...(data.filename !== undefined ? { filename: data.filename } : {}),
        ...(data.mimeType !== undefined ? { mimeType: data.mimeType } : {}),
        ...(data.width !== undefined ? { width: data.width } : {}),
        ...(data.height !== undefined ? { height: data.height } : {}),
        ...(data.fileSize !== undefined ? { fileSize: data.fileSize } : {}),
        ...(data.encodingFormat !== undefined ? { encodingFormat: data.encodingFormat } : {}),
        ...(movedBunnyUrl !== undefined ? { bunnyUrl: movedBunnyUrl } : {}),
      },
    });

    // Regenerate JSON-LD for all articles using this media
    const relatedArticles = await db.article.findMany({
      where: {
        OR: [
          { featuredImageId: id },
          { gallery: { some: { mediaId: id } } },
        ],
      },
      select: { id: true },
    });

    if (relatedArticles.length > 0) {
      await Promise.all(
        relatedArticles.map((article) => generateAndSaveJsonLd(article.id).catch(() => null))
      );

      // Also regenerate metadata for related articles (image URLs in OG metadata, etc.)
      try {
        const { generateAndSaveNextjsMetadata } = await import("@/lib/seo/metadata-storage");
        for (const article of relatedArticles) {
          await generateAndSaveNextjsMetadata(article.id);
        }
      } catch {
        // Don't fail the update if metadata regeneration fails
      }
    }

    await logAction("media.update", {
      entity: "Media",
      entityId: media.id,
      summary: media.filename,
    });

    revalidatePath("/media");
    revalidatePath("/articles");
    // Revalidate all article detail pages (dynamic route pattern)
    revalidatePath("/articles/[id]", "page");
    revalidatePath("/articles/[id]/technical", "page");
    // Editing/replacing media changes what modonty's public surfaces show
    // (partner slider · client page · article client card) → invalidate its caches.
    await revalidateModontyTag("clients");
    await revalidateModontyTag("articles");
    return { success: true, media };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update media";
    return { success: false, error: message };
  }
}
