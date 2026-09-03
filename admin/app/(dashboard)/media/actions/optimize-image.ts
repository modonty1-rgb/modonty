"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { deleteCloudinaryAsset } from "@/lib/utils/cloudinary-delete";
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
  /** Fresh placeholder for the re-encoded file — the old one describes a dead image. */
  blurDataURL?: string | null;
}

/**
 * `seoWarning` — the Media row swapped, but at least one cached SEO blob that had copied
 * the old URL failed to rebuild. The image is correct; the blob modonty serves is not.
 */
type Result = { success: true; seoWarning?: string } | { success: false; error: string };

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
      select: { id: true, clientId: true, cloudinaryPublicId: true },
    });
    if (!existing) return { success: false, error: "الصورة غير موجودة" };

    // Ask the CDN whether the re-encoded file actually serves before the row starts naming
    // it. The old asset gets deleted further down, so a row pointing at an address that
    // never answered would leave the image with no working URL at all.
    // A one-byte range GET, NOT a HEAD: Bunny answers HEAD with 404 for a file its edge does
    // not hold yet, and a file uploaded seconds ago is cold by definition — so a HEAD here
    // would refuse the optimization of a perfectly good upload (measured 31 Aug 2026).
    const serves = await fetch(url, { headers: { range: "bytes=0-0" } })
      .then((r) => r.ok)
      .catch(() => false);
    if (!serves) {
      return { success: false, error: "الصورة الجديدة ما تفتح على الرابط — ما غيّرنا شي." };
    }

    await db.media.update({
      where: { id: mediaId },
      data: {
        url,
        contentUrl: url,
        // Bunny-primary: the optimizer now uploads to Bunny — sync bunnyUrl with the new
        // url, else a stale bunnyUrl would keep serving the OLD image via mediaSrc().
        // When the new file did NOT land on Bunny, the old bunnyUrl must be CLEARED, not
        // left: mediaSrc() prefers it, so it would keep serving the old picture next to
        // the new width/height/fileSize written below — wrong image, wrong dimensions.
        bunnyUrl: url.includes(".b-cdn.net/") ? url : null,
        mimeType: input.mimeType || "image/webp",
        encodingFormat: input.mimeType || "image/webp",
        fileSize: input.fileSize ?? undefined,
        width: input.width ?? undefined,
        height: input.height ?? undefined,
        // Same reason as bunnyUrl above: a stale placeholder would flash the OLD image's
        // colours behind the new one. `undefined` when the uploader couldn't build it, so
        // we keep the previous value rather than blanking a working placeholder.
        blurDataURL: input.blurDataURL ?? undefined,
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
    // All three generators RETURN { success, error } and never throw, so `.catch(() => {})`
    // caught nothing: a blob that failed to rebuild kept the OLD image URL, and the caller
    // was told the optimisation succeeded. Count the failures instead.
    let staleArticles = 0;
    for (const [articleId, status] of articleMap) {
      const robots = status === "PUBLISHED" ? "index, follow" : "noindex, follow";
      const metadataResult = await generateAndSaveNextjsMetadata(articleId, { robots }).catch(
        (e: unknown) => ({ success: false as const, error: e instanceof Error ? e.message : String(e) }),
      );
      const jsonLdResult = await generateAndSaveJsonLd(articleId).catch(
        (e: unknown) => ({ success: false as const, error: e instanceof Error ? e.message : String(e) }),
      );
      if (!metadataResult.success || !jsonLdResult.success) staleArticles++;
    }

    // 2. Owning client's SEO bundle (Organization.image[] dimensions/url changed).
    let clientStale = false;
    if (existing.clientId) {
      const clientResult = await generateClientSEO(existing.clientId).catch(
        (e: unknown) => ({ success: false as const, error: e instanceof Error ? e.message : String(e) }),
      );
      clientStale = !clientResult.success;
    }

    const seoFailures: string[] = [];
    if (staleArticles > 0) seoFailures.push(`${staleArticles} مقالاً ما تجدّدت بياناته`);
    if (clientStale) seoFailures.push("بيانات الشريك ما تجدّدت");

    // A third step used to live here: reels had copied this image's URL into their own
    // row, so optimizing the image left them pointing at a deleted file. The reel IS this
    // row now (2026-08-05), so the URL it shows is the one we just wrote. Nothing to sync.

    // Delete the old Cloudinary asset ONLY once nothing still names it: the row was
    // rewritten above and every cached blob that had copied the old URL was rebuilt. A
    // blob that failed to rebuild still carries the old address, so deleting the file
    // under it would turn a stale link into a dead one. It stays until the next run —
    // one billed orphan is cheaper than a 404 inside published JSON-LD.
    const oldPublicId = existing.cloudinaryPublicId;
    if (oldPublicId && oldPublicId !== input.publicId && seoFailures.length === 0) {
      await deleteCloudinaryAsset(oldPublicId, "image").catch(() => {});
    }

    // Only rebuild the public pages whose blob actually rebuilt — pushing a rebuild on top
    // of a stale blob republishes the old image URL as if it were fresh.
    if (!clientStale) await revalidateModontyTag("clients").catch(() => {});
    if (staleArticles === 0) await revalidateModontyTag("articles").catch(() => {});
    revalidatePath("/media/maintenance");

    if (seoFailures.length > 0) {
      console.error("Optimized image SEO refresh failed:", mediaId, seoFailures.join(" · "));
      return {
        success: true,
        seoWarning: `الصورة اتبدّلت، لكن بيانات السيو ما تجدّدت — جوجل بيبقى يشوف الصورة القديمة. (${seoFailures.join(" · ")})`,
      };
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "فشل تحديث الصورة" };
  }
}
