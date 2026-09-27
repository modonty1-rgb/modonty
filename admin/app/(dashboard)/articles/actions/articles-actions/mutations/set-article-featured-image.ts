"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
import { deleteMedia } from "@/lib/media/delete-media";
import { generateAndSaveNextjsMetadata } from "@/lib/seo/metadata-storage";
import { generateAndSaveJsonLd } from "@/lib/seo/jsonld-storage";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

const schema = z.object({ articleId: z.string().min(1), mediaId: z.string().min(1) });

/**
 * Put a new image as an article's featured image — from Articles › Media, without opening the
 * whole article editor (Khalid, 26 Sep 2026). Does the part of `updateArticle` an image change
 * needs: the field, then the two cached blobs that copied the image URL (metadata og:image and
 * JSON-LD), then the admin paths — and modonty only when both blobs rebuilt, the same rule
 * updateArticle follows so a stale blob is never republished as fresh.
 *
 * Then the previous image goes, through `deleteMedia` — its guard keeps it if another article
 * or client still uses it. Same replace rule as the client page slots.
 */
export async function setArticleFeaturedImage(articleId: string, mediaId: string) {
  const session = await auth();
  if (!session) return { success: false as const, error: "Unauthorized" };

  const parsed = schema.safeParse({ articleId, mediaId });
  if (!parsed.success) return { success: false as const, error: parsed.error.errors[0].message };

  const article = await db.article.findUnique({
    where: { id: articleId },
    select: { id: true, title: true, slug: true, status: true, featuredImageId: true },
  });
  if (!article) return { success: false as const, error: "Article not found" };

  // The editor refuses a featured image without alt text (article-validation.ts) — same here.
  const media = await db.media.findUnique({ where: { id: mediaId }, select: { altText: true } });
  if (!media) return { success: false as const, error: "Media not found" };
  if (!media.altText?.trim()) return { success: false as const, error: "Alt text is required for a featured image" };

  const previousId = article.featuredImageId;
  await db.article.update({ where: { id: articleId }, data: { featuredImageId: mediaId } });

  const robots = article.status === "PUBLISHED" ? "index, follow" : "noindex, follow";
  const [meta, jsonLd] = await Promise.all([
    generateAndSaveNextjsMetadata(articleId, { robots }).catch((e: unknown) => ({ success: false as const, error: String(e) })),
    generateAndSaveJsonLd(articleId).catch((e: unknown) => ({ success: false as const, error: String(e) })),
  ]);
  const seoOk = meta.success && jsonLd.success;

  await logAction("article.update", {
    entity: "Article",
    entityId: articleId,
    summary: article.title,
    metadata: { field: "featuredImage", from: previousId, to: mediaId },
  });

  revalidatePath("/articles");
  revalidatePath(`/articles/${articleId}`);
  revalidatePath("/articles/media");
  if (seoOk) await revalidateModontyTag("articles").catch(() => {});

  let removedOld = false;
  let keptOldReason: string | undefined;
  if (previousId && previousId !== mediaId) {
    const r = await deleteMedia(previousId);
    removedOld = r.success;
    if (!r.success) keptOldReason = ("error" in r && r.error) || "still in use";
  }

  return { success: true as const, seoOk, removedOld, keptOldReason };
}
