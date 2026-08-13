"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { generateClientSEO } from "@/app/(dashboard)/clients/actions/clients-actions/generate-client-seo";
import { generateAndSaveJsonLd } from "@/lib/seo";
import { logAction } from "@/lib/audit/log-action";
import {
  BUNNY_ASPECT_SUFFIX,
  bunnyAspectUrl,
  bunnyRenamedPath,
  bunnyZoneOfUrl,
  extractBunnyPath,
  extractBunnyUniqueKey,
  moveBunnyMedia,
} from "@modonty/database/lib/bunny";

/**
 * NARROW save for the writer-owned image SEO (the "SEO Images" section AND the article
 * editor's Media tab): the fields the content writer edits on an image (alt text · description ·
 * optional title · optional descriptive filename). After the partial media update it regenerates
 * the stored JSON-LD of every entity whose schema embeds this image:
 *   • CLIENTS using it as logo / hero / gallery (closing the image→client gap, step 17), and
 *   • ARTICLES using it as featured image or in the article gallery.
 *
 * FILENAME rename (optional): renames the object ON BUNNY — the name that actually appears in
 * the served URL, which is what Google indexes. It used to rename the Cloudinary public_id
 * instead, which since the Bunny switch renamed a copy nobody serves: the panel then scored a
 * name no visitor ever sees, and for a Bunny-only upload (no public_id at all) the rename was
 * skipped in silence while the toast still said "saved".
 *
 * Bunny has no native rename, so this is a move (copy → delete) that PRESERVES the object's
 * unique suffix — a rename must not mint a new key, see `extractBunnyUniqueKey`. Article images
 * carry three pre-generated aspect crops that move with the base, else the JSON-LD crop URLs 404.
 *
 * Safe for by-ID references (cover / gallery) because they read the fresh Media row, and every
 * entity that stores the url as a raw STRING is rewritten through `syncEntityImageUrls`.
 * GUARD: an image whose URL is hard-coded inside an article's body HTML is refused — no
 * regeneration can fix that inline reference (documented exception).
 */
const schema = z.object({
  mediaId: z.string().min(1),
  altText: z.string().trim().max(300).nullable().optional(),
  description: z.string().trim().max(600).nullable().optional(),
  title: z.string().trim().max(200).nullable().optional(),
  /** New descriptive base name (no folder, no extension). Empty/undefined = no rename. */
  filename: z.string().trim().max(120).optional(),
});

export type SaveImageSeoInput = z.infer<typeof schema>;

/** URL-safe descriptive slug: keep Arabic/Latin/digits/underscore, everything else → hyphen.
 *  Arabic survives on purpose — it is a real SEO signal and Bunny serves it (see bunny.ts). */
function sanitizeFileBase(name: string): string {
  return name
    .trim()
    .replace(/\.[a-z0-9]+$/i, "") // drop an extension if present
    .replace(/[^A-Za-z0-9_؀-ۿ]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/** The object's file name as stored on Bunny, decoded and without its extension. */
function bunnyStem(url: string): string {
  const last = (url.split("?")[0] ?? "").split("/").pop() ?? "";
  let decoded: string;
  try {
    decoded = decodeURIComponent(last); // Arabic names travel percent-encoded
  } catch {
    decoded = last;
  }
  return decoded.replace(/\.[^.]+$/, "");
}

function extOf(filename: string | null, url: string): string {
  const fromName = filename?.match(/\.[a-z0-9]+$/i)?.[0];
  if (fromName) return fromName;
  const fromUrl = url.match(/\.([a-z0-9]+)(?:$|\?)/i)?.[0]?.replace(/\?.*$/, "");
  return fromUrl ?? "";
}

export async function saveImageSeo(
  input: SaveImageSeoInput
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { mediaId, altText, description, title, filename } = parsed.data;

  // ── Automatic filename sync (the Bunny object name → the SEO name) ────────────
  // Best-effort: never blocks the alt/description save. Skipped when the name already matches,
  // when the row has no Bunny object, when the image is embedded inside article body HTML
  // (renaming would break that inline <img> — the documented exception), or on storage error.
  const renameData: Prisma.MediaUpdateInput = {};
  let prevSrc: string | null = null;
  let newSrc: string | null = null;
  const newBase = filename ? sanitizeFileBase(filename) : "";
  if (newBase) {
    const media = await db.media.findUnique({
      where: { id: mediaId },
      select: { url: true, bunnyUrl: true, filename: true, type: true },
    });
    // The Bunny link is NOT always in `bunnyUrl`: a client-gallery image uploaded from the
    // console stores it in `url` with `bunnyUrl` still null. Resolve the SERVED url the same
    // way every renderer does, then let the zone lookup decide whether it is ours to rename.
    const currentUrl = media ? (media.bunnyUrl ?? media.url ?? null) : null;
    if (media && currentUrl) {
      const uniqueKey = extractBunnyUniqueKey(currentUrl);
      const oldStem = bunnyStem(currentUrl);
      const oldBase =
        uniqueKey && oldStem.endsWith(`-${uniqueKey}`)
          ? oldStem.slice(0, -(uniqueKey.length + 1))
          : oldStem;

      if (oldBase && newBase !== oldBase) {
        // Match on the FULL stem (name + unique suffix): it is unique per object, so a short
        // or generic descriptive part can never produce a false "it's inline" refusal.
        const inlineUse = await db.article.findFirst({
          where: { content: { contains: oldStem } },
          select: { id: true },
        });
        // The row may live on the clients zone (admin upload) or the reels zone (a gallery
        // image uploaded from the console) — resolve it, never assume.
        const zone = bunnyZoneOfUrl(currentUrl);
        const currentPath = zone ? extractBunnyPath(zone, currentUrl) : null;

        if (!inlineUse && zone && currentPath) {
          try {
            // Same folder, same unique suffix — only the descriptive part changes. Rows
            // written before the 2026-08-07 fix carry no suffix; the media id is stable.
            const newPath = bunnyRenamedPath(currentPath, newBase, mediaId);
            const moved = await moveBunnyMedia(zone, currentUrl, newPath);

            // Article images carry 3 pre-generated aspect crops next to the base — move them
            // too, else the crop URLs baked into the article JSON-LD 404 at the new name.
            if (media.type === "POST") {
              for (const suffix of Object.values(BUNNY_ASPECT_SUFFIX)) {
                await moveBunnyMedia(
                  zone,
                  bunnyAspectUrl(currentUrl, suffix),
                  bunnyAspectUrl(newPath, suffix)
                ).catch(() => null); // a missing crop must not abort the base rename
              }
            }

            prevSrc = currentUrl;
            newSrc = moved.url;
            renameData.filename = newBase + extOf(media.filename, currentUrl);
            // Rewrite exactly the column(s) that pointed at the object we just moved — no
            // more. A migrated row keeps its historical Cloudinary `url` untouched, and a
            // console-uploaded row keeps `bunnyUrl` null rather than gaining a value here.
            if (media.bunnyUrl === currentUrl) renameData.bunnyUrl = moved.url;
            if (media.url === currentUrl) renameData.url = moved.url;
          } catch {
            // Storage failure must never cost the writer their alt/description edit.
          }
        }
      }
    }
  }

  let affectedClientIds: string[] = [];
  let affectedArticleIds: string[] = [];
  let imageName: string | null = null;
  try {
    const media = await db.media.update({
      where: { id: mediaId },
      data: {
        altText: altText?.trim() || null,
        description: description?.trim() || null,
        title: title?.trim() || null,
        ...renameData,
      },
      select: {
        filename: true,
        type: true,
        clientId: true,
        logoClients: { select: { id: true } },
        heroImageClients: { select: { id: true } },
        featuredArticles: { select: { id: true } },
        articleGallery: { select: { articleId: true } },
      },
    });
    imageName = media.filename;
    const ids = new Set<string>();
    media.logoClients.forEach((c) => ids.add(c.id));
    media.heroImageClients.forEach((c) => ids.add(c.id));
    // A GALLERY image is owned by its client and rendered in that client's image[].
    if (media.type === "GALLERY" && media.clientId) ids.add(media.clientId);
    affectedClientIds = [...ids];

    const articleIds = new Set<string>();
    media.featuredArticles.forEach((a) => articleIds.add(a.id));
    media.articleGallery.forEach((g) => articleIds.add(g.articleId));
    affectedArticleIds = [...articleIds];
  } catch {
    return { success: false, error: "تعذّر حفظ بيانات الصورة — حاول مرة أخرى." };
  }

  // A rename changes the SERVED url, and tags/categories/industries/pages/settings store that
  // url as a raw STRING with no relation to follow back. Without this they keep the dead name
  // in their baked SEO — the same dual-field integrity rule updateMedia already enforces.
  let entitySync: Awaited<
    ReturnType<typeof import("@/lib/media/sync-entity-image-urls").syncEntityImageUrls>
  > | null = null;
  if (newSrc && newSrc !== prevSrc) {
    try {
      const { syncEntityImageUrls } = await import("@/lib/media/sync-entity-image-urls");
      entitySync = await syncEntityImageUrls(mediaId, newSrc, prevSrc);
    } catch {
      // Best-effort — the SEO save itself must not fail on a sync error.
    }
  }

  // Regenerate each owning client so the new alt/description/url reaches its stored JSON-LD.
  for (const cid of affectedClientIds) {
    await generateClientSEO(cid).catch(() => null);
  }
  // Same for each owning article (featured image / article gallery).
  for (const aid of affectedArticleIds) {
    await generateAndSaveJsonLd(aid).catch(() => null);
  }

  await logAction("media.seo", {
    entity: "Media",
    entityId: mediaId,
    summary: imageName ?? mediaId,
  });

  revalidatePath("/seo-images");
  if (newSrc) revalidatePath("/media");
  if (affectedClientIds.length > 0) await revalidateModontyTag("clients");
  if (affectedArticleIds.length > 0) await revalidateModontyTag("articles");
  if (entitySync) {
    if (entitySync.tags) await revalidateModontyTag("tags");
    if (entitySync.categories) await revalidateModontyTag("categories");
    if (entitySync.industries || entitySync.settings) await revalidateModontyTag("industries");
    if (entitySync.pages || entitySync.settings) await revalidateModontyTag("settings");
  }

  return { success: true };
}
