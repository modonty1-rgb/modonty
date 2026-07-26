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

export interface CategoryMergeImpact {
  /** Articles reassigned source → target (category is singular, so no dedup). */
  movedCount: number;
  /** Subcategories re-parented source → target. */
  childrenCount: number;
  /** Articles needing SEO+JSON-LD regeneration (= movedCount; articleSection carries the name). */
  affectedCount: number;
}

/**
 * Read-only preview so the dialog shows real numbers before the operator commits.
 * Category is a singular FK on Article, so every source article simply moves — no
 * dedup. Children (subcategories) are re-parented to the target.
 */
export async function getCategoryMergeImpact(sourceId: string, targetId: string): Promise<CategoryMergeImpact> {
  if (!sourceId || !targetId || sourceId === targetId) {
    return { movedCount: 0, childrenCount: 0, affectedCount: 0 };
  }
  const [movedCount, childrenCount] = await Promise.all([
    db.article.count({ where: { categoryId: sourceId } }),
    db.category.count({ where: { parentId: sourceId, id: { not: targetId } } }),
  ]);
  return { movedCount, childrenCount, affectedCount: movedCount };
}

export interface PrepareCategoryMergeResult {
  success: boolean;
  error?: string;
  sourceName?: string;
  targetName?: string;
  /** Every article that needs SEO+JSON-LD regeneration (all moved). */
  affectedArticleIds?: string[];
  movedCount?: number;
  childrenCount?: number;
}

/**
 * Walk up the target's ancestor chain; true if `sourceId` is an ancestor of the
 * target. Merging a category into one of its own descendants would create a
 * parent cycle when we re-parent children — so it's blocked.
 */
async function targetIsDescendantOfSource(sourceId: string, targetId: string): Promise<boolean> {
  let currentId: string | null = targetId;
  // Bounded walk — categories are shallow; the cap just guards against bad data cycles.
  for (let i = 0; i < 50 && currentId; i++) {
    const node: { parentId: string | null } | null = await db.category.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });
    if (!node || !node.parentId) return false;
    if (node.parentId === sourceId) return true;
    currentId = node.parentId;
  }
  return false;
}

/**
 * Phase 1 (atomic): reassign every article from the source category to the target,
 * re-parent the source's subcategories onto the target, and record the 308 — all in
 * one transaction. Leaves the source category existing but with zero articles and
 * zero children (Khalid deletes it from the table afterwards; the 308 fires then).
 *
 * Returns the affected article ids so the client can regenerate their SEO one by one
 * (Phase 2) with a live progress bar — the article JSON-LD embeds the category name
 * (articleSection / OG section), so it must be rebuilt. Re-parented children need no
 * regeneration: the category JSON-LD breadcrumb is flat (Home › Categories › name),
 * independent of parentId.
 */
export async function prepareCategoryMerge(input: {
  sourceId: string;
  targetId: string;
  confirmName: string;
}): Promise<PrepareCategoryMergeResult> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = prepareSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };
    const { sourceId, targetId, confirmName } = parsed.data;

    if (sourceId === targetId) {
      return { success: false, error: "Cannot merge a category into itself." };
    }

    const [source, target] = await Promise.all([
      db.category.findUnique({ where: { id: sourceId }, select: { id: true, name: true, slug: true } }),
      db.category.findUnique({ where: { id: targetId }, select: { id: true, name: true, slug: true } }),
    ]);

    if (!source) return { success: false, error: "Source category not found." };
    if (!target) return { success: false, error: "Target category not found." };

    if (confirmName.trim() !== source.name.trim()) {
      return { success: false, error: "Confirmation text does not match the source category name." };
    }

    // Guard the hierarchy: merging a category into its own descendant would make the
    // target its own ancestor's parent (a cycle) when children are re-parented.
    if (await targetIsDescendantOfSource(sourceId, targetId)) {
      return { success: false, error: "Cannot merge a category into one of its own subcategories." };
    }

    const sourceArticles = await db.article.findMany({
      where: { categoryId: sourceId },
      select: { id: true },
    });
    const affectedArticleIds = sourceArticles.map((a) => a.id);
    const childrenCount = await db.category.count({ where: { parentId: sourceId, id: { not: targetId } } });

    await db.$transaction(async (tx) => {
      // Reassign every source article to the target category (singular FK — no dedup).
      await tx.article.updateMany({
        where: { categoryId: sourceId },
        data: { categoryId: targetId },
      });
      // Re-parent the source's subcategories onto the target (never the target itself).
      await tx.category.updateMany({
        where: { parentId: sourceId, id: { not: targetId } },
        data: { parentId: targetId },
      });
      // Permanent redirect old slug → target slug (collapses any existing chain).
      await recordRedirect(tx, "categories", source.slug, target.slug);
    });

    await logAction("category.merge", {
      entity: "Category",
      entityId: sourceId,
      summary: `Merged "${source.name}" → "${target.name}"`,
      metadata: {
        targetId,
        sourceSlug: source.slug,
        targetSlug: target.slug,
        movedCount: affectedArticleIds.length,
        childrenCount,
        redirect: `/categories/${source.slug} → /categories/${target.slug}`,
      },
    });

    return {
      success: true,
      sourceName: source.name,
      targetName: target.name,
      affectedArticleIds,
      movedCount: affectedArticleIds.length,
      childrenCount,
    };
  } catch (error) {
    console.error("prepareCategoryMerge failed:", error);
    const message = error instanceof Error ? error.message : "Failed to merge category";
    return { success: false, error: message };
  }
}

/**
 * Phase 3 (finalize): regenerate both categories' own SEO caches + the categories
 * listing, then revalidate modonty. modonty's in-memory caches pick up the change
 * within their 5-minute TTL (documented eventual consistency).
 */
export async function finalizeCategoryMerge(input: { sourceId: string; targetId: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const { generateAndSaveCategorySeo } = await import("@/lib/seo/category-seo-generator");
    const { regenerateCategoriesListingCache } = await import("@/lib/seo/listing-page-seo-generator");

    // Target gains articles; source is now empty — refresh both entity caches.
    await generateAndSaveCategorySeo(input.targetId).catch((e) => console.error("target category SEO:", e));
    await generateAndSaveCategorySeo(input.sourceId).catch((e) => console.error("source category SEO:", e));
    await regenerateCategoriesListingCache().catch((e) => console.error("categories listing:", e));

    revalidatePath("/categories");
    revalidatePath("/articles");
    await revalidateModontyTag("categories");
    await revalidateModontyTag("articles");

    return { success: true };
  } catch (error) {
    console.error("finalizeCategoryMerge failed:", error);
    const message = error instanceof Error ? error.message : "Finalize failed";
    return { success: false, error: message };
  }
}
