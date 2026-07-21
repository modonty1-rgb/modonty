"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { deleteCloudinaryAsset } from "./delete-cloudinary-asset";
import { generateClientSEO } from "@/app/(dashboard)/clients/actions/clients-actions/generate-client-seo";
import { generateAndSaveJsonLd } from "@/lib/seo/jsonld-storage";
import { generateAndSaveNextjsMetadata } from "@/lib/seo/metadata-storage";

// After the browser re-compresses one image to WebP and re-uploads it to Cloudinary, we
// swap the Media row's url/format/size/dimensions in place. Every reference points at the
// Media by id (article featured, client logo/hero, gallery by clientId+type), so updating
// the row propagates the lighter image everywhere. The OLD Cloudinary asset is then DELETED
// so it doesn't sit as dead, billed storage.
//
// ⚠️ Cloudinary is ONE shared account across dev + prod. Deleting the old asset removes it
// globally — run this optimizer in PRODUCTION only (same rule as the Orphans cleaner), or a
// prod page still pointing at the old public_id would break.

export interface OptimizedImageInput {
  url: string;
  publicId?: string | null;
  mimeType: string;
  fileSize: number | null;
  width: number | null;
  height: number | null;
}

type Result = { success: true } | { success: false; error: string };

export async function saveOptimizedImage(
  mediaId: string,
  input: OptimizedImageInput,
): Promise<Result> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرّح" };
  if (!mediaId?.trim()) return { success: false, error: "معرّف الصورة مفقود" };

  const url = (input.url ?? "").trim();
  if (!url.startsWith("http")) return { success: false, error: "رابط الصورة غير صالح" };

  try {
    const existing = await db.media.findUnique({
      where: { id: mediaId },
      select: { id: true, url: true, clientId: true, cloudinaryPublicId: true },
    });
    if (!existing) return { success: false, error: "الصورة غير موجودة" };
    const oldUrl = existing.url;

    await db.media.update({
      where: { id: mediaId },
      data: {
        url,
        contentUrl: url,
        mimeType: input.mimeType || "image/webp",
        encodingFormat: input.mimeType || "image/webp",
        fileSize: input.fileSize ?? undefined,
        width: input.width ?? undefined,
        height: input.height ?? undefined,
        cloudinaryPublicId: input.publicId ?? undefined,
      },
    });

    // The live site reads media.url via id-relations, so the swap propagates on its own.
    // BUT three places copied the URL as a literal string and must be refreshed:
    //   1. cached article SEO (jsonLdStructuredData + nextjsMetadata og:image),
    //   2. cached client SEO,
    //   3. any Reel that was spawned from this image (imageUrl/thumbnailUrl copies).

    // 1. Articles that use this image as featured OR inside their gallery.
    const [featuredArticles, galleryLinks] = await Promise.all([
      db.article.findMany({ where: { featuredImageId: mediaId }, select: { id: true, status: true } }),
      db.articleMedia.findMany({ where: { mediaId }, select: { article: { select: { id: true, status: true } } } }),
    ]);
    const articleMap = new Map<string, string>();
    for (const a of featuredArticles) articleMap.set(a.id, a.status);
    for (const g of galleryLinks) if (g.article) articleMap.set(g.article.id, g.article.status);
    for (const [articleId, status] of articleMap) {
      const robots = status === "PUBLISHED" ? "index, follow" : "noindex, follow";
      await generateAndSaveNextjsMetadata(articleId, { robots }).catch(() => {});
      await generateAndSaveJsonLd(articleId).catch(() => {});
    }

    // 2. Owning client's SEO bundle (Organization.image[] dimensions/url changed).
    if (existing.clientId) {
      await generateClientSEO(existing.clientId).catch(() => {});
    }

    // 3. Reels that copied this image's URL → point them at the new WebP.
    if (oldUrl) {
      await db.reel
        .updateMany({ where: { imageUrl: oldUrl }, data: { imageUrl: url, thumbnailUrl: url } })
        .catch(() => {});
    }

    // Now that nothing references the old URL, delete the old Cloudinary asset — no dead,
    // billed storage. Best-effort: the DB is already correct; a failed delete just leaves
    // one orphan for the Orphans cleaner.
    const oldPublicId = existing.cloudinaryPublicId;
    if (oldPublicId && oldPublicId !== input.publicId) {
      await deleteCloudinaryAsset(oldPublicId, "image").catch(() => {});
    }

    await revalidateModontyTag("clients").catch(() => {});
    await revalidateModontyTag("articles").catch(() => {});
    revalidatePath("/media/maintenance");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "فشل تحديث الصورة" };
  }
}
