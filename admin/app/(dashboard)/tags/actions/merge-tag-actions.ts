"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { recordRedirect } from "@/lib/redirect/record-redirect";

const prepareSchema = z.object({
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  // Type-to-confirm gate: must match the SOURCE name exactly (what gets emptied).
  confirmName: z.string().min(1),
});

export interface TagMergeImpact {
  movedCount: number;
  dedupCount: number;
  affectedCount: number;
}

/**
 * Read-only preview of a source→target merge so the dialog can show real numbers
 * before the operator commits (never invented figures). Cheap: two id-only queries.
 */
export async function getTagMergeImpact(sourceId: string, targetId: string): Promise<TagMergeImpact> {
  if (!sourceId || !targetId || sourceId === targetId) {
    return { movedCount: 0, dedupCount: 0, affectedCount: 0 };
  }
  const [sourceLinks, targetLinks] = await Promise.all([
    db.articleTag.findMany({ where: { tagId: sourceId }, select: { articleId: true } }),
    db.articleTag.findMany({ where: { tagId: targetId }, select: { articleId: true } }),
  ]);
  const targetIds = new Set(targetLinks.map((l) => l.articleId));
  const dedupCount = sourceLinks.filter((l) => targetIds.has(l.articleId)).length;
  return {
    movedCount: sourceLinks.length - dedupCount,
    dedupCount,
    affectedCount: sourceLinks.length,
  };
}

export interface PrepareTagMergeResult {
  success: boolean;
  error?: string;
  sourceName?: string;
  targetName?: string;
  /** Every article that needs SEO+JSON-LD regeneration (moved ∪ deduped). */
  affectedArticleIds?: string[];
  movedCount?: number;
  dedupCount?: number;
}

/**
 * Phase 1 (atomic): move every article link from the source tag to the target,
 * dedup on the ArticleTag unique key, and record the 308 redirect — all in one
 * transaction. Leaves the source tag existing but with zero articles (Khalid
 * deletes it from the table afterwards; the 308 fires the moment he does).
 *
 * Returns the affected article ids so the client can regenerate their SEO one by
 * one (Phase 2) with a live progress bar. That regeneration is idempotent, so a
 * mid-way interruption never corrupts data — only leaves stale SEO to re-run.
 */
export async function prepareTagMerge(input: {
  sourceId: string;
  targetId: string;
  confirmName: string;
}): Promise<PrepareTagMergeResult> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = prepareSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };
    const { sourceId, targetId, confirmName } = parsed.data;

    if (sourceId === targetId) {
      return { success: false, error: "Cannot merge a tag into itself." };
    }

    const [source, target] = await Promise.all([
      db.tag.findUnique({ where: { id: sourceId }, select: { id: true, name: true, slug: true } }),
      db.tag.findUnique({ where: { id: targetId }, select: { id: true, name: true, slug: true } }),
    ]);

    if (!source) return { success: false, error: "Source tag not found." };
    if (!target) return { success: false, error: "Target tag not found." };

    if (confirmName.trim() !== source.name.trim()) {
      return { success: false, error: "Confirmation text does not match the source tag name." };
    }

    // Articles already carrying the target tag → their source link is a duplicate.
    const [sourceLinks, targetLinks] = await Promise.all([
      db.articleTag.findMany({ where: { tagId: sourceId }, select: { articleId: true } }),
      db.articleTag.findMany({ where: { tagId: targetId }, select: { articleId: true } }),
    ]);

    const targetArticleIds = new Set(targetLinks.map((l) => l.articleId));
    const sourceArticleIds = sourceLinks.map((l) => l.articleId);
    const dedupArticleIds = sourceArticleIds.filter((id) => targetArticleIds.has(id));
    const movedCount = sourceArticleIds.length - dedupArticleIds.length;

    await db.$transaction(async (tx) => {
      // Drop duplicate source links first so the move can't violate @@unique([articleId, tagId]).
      if (dedupArticleIds.length > 0) {
        await tx.articleTag.deleteMany({
          where: { tagId: sourceId, articleId: { in: dedupArticleIds } },
        });
      }
      // Move every remaining source link onto the target tag.
      await tx.articleTag.updateMany({
        where: { tagId: sourceId },
        data: { tagId: targetId },
      });
      // Permanent redirect old slug → target slug (collapses any existing chain).
      await recordRedirect(tx, "tags", source.slug, target.slug);
    });

    await logAction("tag.merge", {
      entity: "Tag",
      entityId: sourceId,
      summary: `Merged "${source.name}" → "${target.name}"`,
      metadata: {
        targetId,
        sourceSlug: source.slug,
        targetSlug: target.slug,
        movedCount,
        dedupCount: dedupArticleIds.length,
        redirect: `/tags/${source.slug} → /tags/${target.slug}`,
      },
    });

    return {
      success: true,
      sourceName: source.name,
      targetName: target.name,
      affectedArticleIds: sourceArticleIds, // moved ∪ deduped — all need regeneration
      movedCount,
      dedupCount: dedupArticleIds.length,
    };
  } catch (error) {
    console.error("prepareTagMerge failed:", error);
    const message = error instanceof Error ? error.message : "Failed to merge tag";
    return { success: false, error: message };
  }
}

export interface RegenerateArticleResult {
  success: boolean;
  articleId: string;
  title?: string;
  error?: string;
}

/**
 * Phase 2 (per article, idempotent): rebuild one moved article's Next.js metadata
 * + JSON-LD so its keyword/tag data reflects the target tag. Called in a client
 * loop to drive the live progress bar.
 */
export async function regenerateArticleSeoForMerge(articleId: string): Promise<RegenerateArticleResult> {
  try {
    const session = await auth();
    if (!session) return { success: false, articleId, error: "Unauthorized" };

    const article = await db.article.findUnique({ where: { id: articleId }, select: { title: true } });
    if (!article) return { success: false, articleId, error: "Article not found" };

    const { generateAndSaveNextjsMetadata } = await import("@/lib/seo/metadata-storage");
    const { generateAndSaveJsonLd } = await import("@/lib/seo/jsonld-storage");
    await generateAndSaveNextjsMetadata(articleId);
    await generateAndSaveJsonLd(articleId);

    return { success: true, articleId, title: article.title };
  } catch (error) {
    console.error("regenerateArticleSeoForMerge failed:", articleId, error);
    const message = error instanceof Error ? error.message : "Regeneration failed";
    return { success: false, articleId, error: message };
  }
}

/**
 * Phase 3 (finalize): regenerate both tags' own SEO caches + the tags/articles
 * listings, then revalidate modonty. modonty's in-memory slug/redirect caches
 * pick up the change within their 5-minute TTL (cross-app synchronous clearing
 * isn't possible — documented eventual consistency).
 */
export async function finalizeTagMerge(input: { sourceId: string; targetId: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const { generateAndSaveTagSeo } = await import("@/lib/seo/tag-seo-generator");
    const { regenerateTagsListingCache } = await import("@/lib/seo/listing-page-seo-generator");

    // Target gains articles; source is now empty — refresh both entity caches.
    await generateAndSaveTagSeo(input.targetId).catch((e) => console.error("target tag SEO:", e));
    await generateAndSaveTagSeo(input.sourceId).catch((e) => console.error("source tag SEO:", e));
    await regenerateTagsListingCache().catch((e) => console.error("tags listing:", e));

    revalidatePath("/tags");
    revalidatePath("/articles");
    await revalidateModontyTag("tags");
    await revalidateModontyTag("articles");

    return { success: true };
  } catch (error) {
    console.error("finalizeTagMerge failed:", error);
    const message = error instanceof Error ? error.message : "Finalize failed";
    return { success: false, error: message };
  }
}
