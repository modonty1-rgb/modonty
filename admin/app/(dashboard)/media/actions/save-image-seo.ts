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
import { renameCloudinaryAsset } from "./rename-cloudinary-asset";

/**
 * NARROW save for the writer-owned image SEO (the "SEO Images" section AND the article
 * editor's Media tab): the fields the content writer edits on an image (alt text · description ·
 * optional title · optional descriptive filename). After the partial media update it regenerates
 * the stored JSON-LD of every entity whose schema embeds this image:
 *   • CLIENTS using it as logo / hero / gallery (closing the image→client gap, step 17), and
 *   • ARTICLES using it as featured image or in the article gallery.
 *
 * FILENAME rename (optional): renames the Cloudinary public_id (the name Google indexes) and
 * updates Media.url + cloudinaryPublicId. Safe for by-ID references (cover / gallery) because
 * they read the fresh Media.url. GUARD: an image whose URL is hard-coded inside an article's
 * body HTML is refused — regenerating JSON-LD would not fix that inline reference (documented
 * exception). The self-heal only applies to relation-based (by-ID) usage.
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

/** Cloudinary-safe descriptive slug: keep Arabic/Latin/digits/underscore, everything else → hyphen. */
function sanitizeFileBase(name: string): string {
  return name
    .trim()
    .replace(/\.[a-z0-9]+$/i, "") // drop an extension if present
    .replace(/[^A-Za-z0-9_؀-ۿ]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/** Preserve the Cloudinary folder path, replace only the last (file) segment. */
function buildNewPublicId(oldPublicId: string, newBase: string): string {
  const clean = oldPublicId.replace(/\.[a-z0-9]+$/i, "");
  const slash = clean.lastIndexOf("/");
  const folder = slash >= 0 ? clean.slice(0, slash + 1) : "";
  return folder + newBase;
}

function extOf(filename: string | null, url: string): string {
  const fromName = filename?.match(/\.[a-z0-9]+$/i)?.[0];
  if (fromName) return fromName;
  const fromUrl = url.match(/\.([a-z0-9]+)(?:$|\?)/i)?.[0]?.replace(/\?.*$/, "");
  return fromUrl ?? "";
}

export async function saveImageSeo(
  input: SaveImageSeoInput
): Promise<{ success: true; seoWarning?: string } | { success: false; error: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { mediaId, altText, description, title, filename } = parsed.data;

  // ── Automatic filename sync (Cloudinary public_id → the SEO name) ─────────────
  // Best-effort: never blocks the alt/description save. Skipped when the file is already
  // synced, when the image isn't a Cloudinary asset, when it's embedded inside article body
  // HTML (renaming would break that inline <img> — the documented exception), or on API error.
  const renameData: Prisma.MediaUpdateInput = {};
  // Set once the asset has actually moved on Cloudinary, so a failed DB write below can
  // move it back. Cloudinary's rename is a MOVE — the old public_id stops existing — so
  // committing it without a way back is what turned a DB hiccup into a dead image URL.
  let renamedFrom: { from: string; to: string } | null = null;
  const newBase = filename ? sanitizeFileBase(filename) : "";
  if (newBase) {
    const media = await db.media.findUnique({
      where: { id: mediaId },
      select: { cloudinaryPublicId: true, url: true, filename: true },
    });
    const oldPublicId = media?.cloudinaryPublicId;
    const oldBase = oldPublicId ? oldPublicId.replace(/\.[a-z0-9]+$/i, "").split("/").pop() || "" : "";
    if (oldPublicId && newBase !== oldBase) {
      const inlineUse = await db.article.findFirst({
        where: { content: { contains: oldBase } },
        select: { id: true },
      });
      if (!inlineUse) {
        const newPublicId = buildNewPublicId(oldPublicId, newBase);
        const result = await renameCloudinaryAsset(oldPublicId, newPublicId);
        if (result.success) {
          // Ask the CDN whether the new address actually serves the file BEFORE writing it
          // into the row. Writing a URL we have not seen answer is how a rename that half
          // landed became a 404 inside published JSON-LD.
          const serves = await fetch(result.newUrl as string, { method: "HEAD" })
            .then((r) => r.ok)
            .catch(() => false);
          if (serves) {
            renamedFrom = { from: newPublicId, to: oldPublicId };
            renameData.url = result.newUrl;
            renameData.cloudinaryPublicId = result.newPublicId;
            renameData.filename = newBase + extOf(media!.filename, media!.url);
          } else {
            // The move happened but the new address does not answer — put the file back
            // and keep the row exactly as it was. Alt/description still save below.
            await renameCloudinaryAsset(newPublicId, oldPublicId);
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
    // The row did not take the new address, so the file must not keep it either — move it
    // back to where the row still points. Without this the image is reachable at a name
    // nothing in the database knows.
    if (renamedFrom) {
      await renameCloudinaryAsset(renamedFrom.from, renamedFrom.to);
    }
    return { success: false, error: "ما قدرنا نحفظ بيانات الصورة — جرّب مرة ثانية." };
  }

  // Both generators RETURN { success, error } and never throw, so `.catch(() => null)`
  // caught nothing: an entity whose blob failed to rebuild kept the OLD alt text and URL
  // while the writer was told the save went through. Count the failures instead.
  let staleClients = 0;
  for (const cid of affectedClientIds) {
    const result = await generateClientSEO(cid).catch((e: unknown) => ({
      success: false as const,
      error: e instanceof Error ? e.message : String(e),
    }));
    if (!result.success) staleClients++;
  }
  // Same for each owning article (featured image / article gallery).
  let staleArticles = 0;
  for (const aid of affectedArticleIds) {
    const result = await generateAndSaveJsonLd(aid).catch((e: unknown) => ({
      success: false as const,
      error: e instanceof Error ? e.message : String(e),
    }));
    if (!result.success) staleArticles++;
  }

  await logAction("media.seo", {
    entity: "Media",
    entityId: mediaId,
    summary: imageName ?? mediaId,
  });

  revalidatePath("/seo-images");
  // Only rebuild the public pages whose blob actually rebuilt — a rebuild on top of a
  // stale blob republishes the old alt text as if it were fresh.
  if (affectedClientIds.length > 0 && staleClients === 0) await revalidateModontyTag("clients");
  if (affectedArticleIds.length > 0 && staleArticles === 0) await revalidateModontyTag("articles");

  const seoFailures: string[] = [];
  if (staleClients > 0) seoFailures.push(`${staleClients} شريكاً ما تجدّدت بياناته`);
  if (staleArticles > 0) seoFailures.push(`${staleArticles} مقالاً ما تجدّدت بياناته`);
  if (seoFailures.length > 0) {
    console.error("Image SEO refresh failed:", mediaId, seoFailures.join(" · "));
    return {
      success: true,
      seoWarning: `بيانات الصورة انحفظت، لكن بيانات السيو ما تجدّدت — جوجل بيبقى يشوف القديم. (${seoFailures.join(" · ")})`,
    };
  }

  return { success: true };
}
