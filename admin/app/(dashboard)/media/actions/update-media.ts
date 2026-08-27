"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { MediaType, MediaScope } from "@prisma/client";
import { generateAndSaveJsonLd } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
import { buildBunnyMediaPath, moveBunnyMedia, bunnyAspectUrl, extractBunnyPath, BUNNY_ASPECT_SUFFIX } from "@modonty/shared/lib/bunny";

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
  blurDataURL?: string | null; // replace-file flow: the old placeholder describes a dead image
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

    // Snapshot the resolved URL before the edit — entities store mediaSrc (bunnyUrl ?? url),
    // so a change here must propagate to their dual-field strings (syncEntityImageUrls).
    const prev = await db.media.findUnique({ where: { id }, select: { url: true, bunnyUrl: true } });
    const prevSrc = prev?.bunnyUrl ?? prev?.url ?? null;

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
          // A move changes the FOLDER, never the file's identity — so reuse the unique
          // suffix the object already carries rather than minting a new one. Objects
          // written before the 2026-08-07 fix have no suffix; fall back to the media id,
          // which is stable and unique per row.
          const currentStem = decodeURIComponent(
            current.bunnyUrl.split("?")[0].split("/").pop() ?? ""
          ).replace(/\.[^.]+$/, "");
          const existingKey = currentStem.match(/-([A-Za-z0-9]{6,})$/)?.[1];

          const newPath = buildBunnyMediaPath({
            type: data.type ?? current.type,
            scope: data.scope ?? current.scope,
            clientSlug: newSlug,
            filename: current.filename,
            publicId: current.cloudinaryPublicId,
            uniqueKey: existingKey ?? id,
          });
          // ORDER MATTERS. The row's bunnyUrl names the BASE, and the JSON-LD crop URLs
          // are derived from it — so the base must be the LAST file to move, and the row
          // may only start naming the new folder once every derivative is already there.
          // The old order moved the base first and assigned `movedBunnyUrl` immediately;
          // a crop move failing afterwards was swallowed by the `catch` below, and the row
          // was written pointing at the new folder while the three `__16x9`-style crops
          // were still at the old one — dead image links inside published JSON-LD.
          const oldBasePath = extractBunnyPath("clients", current.bunnyUrl);
          if (!oldBasePath) throw new Error("bunnyUrl is not on the clients zone");

          const isPost = (data.type ?? current.type) === "POST";
          const cropMoves = isPost
            ? Object.values(BUNNY_ASPECT_SUFFIX).map((suffix) => ({
                from: bunnyAspectUrl(oldBasePath, suffix),
                to: bunnyAspectUrl(newPath, suffix),
              }))
            : [];

          const done: Array<{ from: string; to: string }> = [];
          try {
            for (const crop of cropMoves) {
              await moveBunnyMedia("clients", crop.from, crop.to);
              done.push(crop);
            }
            const moved = await moveBunnyMedia("clients", current.bunnyUrl, newPath);
            // Committed only now: base AND every crop are at the new folder.
            movedBunnyUrl = moved.url;
          } catch (moveError) {
            // Put back whatever did move. `moveBunnyMedia` copies then deletes, so a crop
            // left behind at the new path would be a dead link at the OLD path the row
            // still names. The base never moved (it is moved last), so undoing the crops
            // restores the exact state the row describes.
            for (const crop of done) {
              await moveBunnyMedia("clients", crop.to, crop.from).catch(() => {});
            }
            throw moveError;
          }
        } catch {
          // Swallow — the metadata edit proceeds; `movedBunnyUrl` stays undefined, so the
          // row keeps its old, still-complete path. A later repair reconciles the folder.
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
        ...(data.blurDataURL !== undefined ? { blurDataURL: data.blurDataURL } : {}),
        ...(data.filename !== undefined ? { filename: data.filename } : {}),
        ...(data.mimeType !== undefined ? { mimeType: data.mimeType } : {}),
        ...(data.width !== undefined ? { width: data.width } : {}),
        ...(data.height !== undefined ? { height: data.height } : {}),
        ...(data.fileSize !== undefined ? { fileSize: data.fileSize } : {}),
        ...(data.encodingFormat !== undefined ? { encodingFormat: data.encodingFormat } : {}),
        ...(movedBunnyUrl !== undefined ? { bunnyUrl: movedBunnyUrl } : {}),
      },
    });

    // URL changed (replace-file or Bunny move) → rewrite every referencing entity's
    // dual-field string + regenerate its baked SEO, else JSON-LD serves a dead link.
    const newSrc = media.bunnyUrl ?? media.url ?? null;
    let entitySync: Awaited<ReturnType<typeof import("@/lib/media/sync-entity-image-urls").syncEntityImageUrls>> | null = null;
    if (newSrc && newSrc !== prevSrc) {
      try {
        const { syncEntityImageUrls } = await import("@/lib/media/sync-entity-image-urls");
        entitySync = await syncEntityImageUrls(id, newSrc, prevSrc);
      } catch {
        // Best-effort — the media edit itself must not fail on sync errors.
      }
    }

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
    if (entitySync) {
      if (entitySync.tags) await revalidateModontyTag("tags");
      if (entitySync.categories) await revalidateModontyTag("categories");
      if (entitySync.industries || entitySync.settings) await revalidateModontyTag("industries");
      if (entitySync.pages || entitySync.settings) await revalidateModontyTag("settings");
    }
    return { success: true, media };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update media";
    return { success: false, error: message };
  }
}
