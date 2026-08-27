"use server";

import { db } from "@/lib/db";
import { buildTaxonomyCanonical } from "@/lib/seo/build-taxonomy-canonical";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
import { categoryServerSchema } from "./category-server-schema";

export async function updateCategory(
  id: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    socialImage?: string | null;
    socialImageAlt?: string | null;
    socialImageMediaId?: string | null;
    cloudinaryPublicId?: string | null;
  },
) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = categoryServerSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const normalizedData = {
      ...data,
      slug: parsed.data.slug,
    };

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    // Slug uniqueness check — excluding THIS category, whichever way it was addressed.
    //
    // `id` is an ObjectId or a slug; line 82 below branches on exactly that. The exclusion
    // used to be `id: { not: isObjectId ? id : undefined }`, and `not: undefined` excludes
    // NOTHING — so a call made with a slug matched the category against itself, `existing`
    // came back truthy, and the save was refused with "This slug is already in use" naming
    // the category's own slug. Re-saving a category without touching its slug was rejected.
    const existing = await db.category.findFirst({
      where: isObjectId
        ? { slug: normalizedData.slug, id: { not: id } }
        : { slug: normalizedData.slug, NOT: { slug: id } },
      select: { id: true },
    });
    if (existing) {
      return { success: false, error: "This slug is already in use. Try a different one." };
    }

    const updateData: {
      name: string;
      slug: string;
      description?: string | null;
      parentId?: string | null;
      seoTitle?: string | null;
      seoDescription?: string | null;
      canonicalUrl?: string | null;
      socialImage?: string | null;
      socialImageAlt?: string | null;
      socialImageMediaId?: string | null;
      cloudinaryPublicId?: string | null;
    } = {
      name: normalizedData.name,
      slug: normalizedData.slug,
      description: normalizedData.description || null,
      parentId: normalizedData.parentId || null,
      seoTitle: normalizedData.seoTitle || null,
      seoDescription: normalizedData.seoDescription || null,
      // Rebuilt from the slug being saved, never taken from the form or the old row — a
      // renamed category used to keep a canonical pointing at its previous address.
      canonicalUrl: await buildTaxonomyCanonical("categories", normalizedData.slug),
    };

    if (data.socialImage !== undefined) updateData.socialImage = data.socialImage;
    if (data.socialImageAlt !== undefined) updateData.socialImageAlt = data.socialImageAlt;
    if (data.socialImageMediaId !== undefined) updateData.socialImageMediaId = data.socialImageMediaId;
    if (data.cloudinaryPublicId !== undefined) updateData.cloudinaryPublicId = data.cloudinaryPublicId;

    const category = await db.category.update({
      where: isObjectId ? { id } : { slug: id },
      data: updateData,
    });

    await logAction("category.update", {
      entity: "Category",
      entityId: category.id,
      summary: category.name,
    });

    revalidatePath("/categories");
    // Regenerate the stored SEO BEFORE revalidating modonty — otherwise the page rebuilds
    // with the stale cached metadata (og:image lags one save behind; caught live 2026-07-31).
    // Both generators RETURN { success, error } and never throw — read the result, or a
    // failed regeneration passes as success and modonty keeps serving the old blob.
    const seoFailures: string[] = [];
    try {
      const { generateAndSaveCategorySeo } = await import("@/lib/seo/category-seo-generator");
      const result = await generateAndSaveCategorySeo(category.id);
      if (!result.success) seoFailures.push(`سيو القسم: ${result.error || "سبب غير معروف"}`);
    } catch (e) { seoFailures.push(`سيو القسم: ${e instanceof Error ? e.message : String(e)}`); }
    try {
      const { regenerateCategoriesListingCache } = await import("@/lib/seo/listing-page-seo-generator");
      const result = await regenerateCategoriesListingCache();
      if (!result.success) seoFailures.push(`صفحة الأقسام: ${result.error || "سبب غير معروف"}`);
    } catch (e) { seoFailures.push(`صفحة الأقسام: ${e instanceof Error ? e.message : String(e)}`); }
    if (seoFailures.length > 0) console.error("Category SEO gen failed:", category.id, seoFailures.join(" · "));
    else await revalidateModontyTag("categories");

    // Cascade: regenerate BOTH stored blobs for every article in this category.
    let articleCascadeFailed = 0;
    try {
      const categoryArticles = await db.article.findMany({
        where: { categoryId: category.id },
        select: { id: true },
      });
      if (categoryArticles.length > 0) {
        const { batchRegenerateArticleSeo } = await import("@/lib/seo");
        // This rebuilt the JSON-LD only, so renaming a category left `article:section` in
        // `Article.nextjsMetadata` on the old name. See the regeneration matrix in
        // batch-regenerate-article-seo.ts.
        //
        // It counts its own failures instead of throwing — ignoring the count is how a
        // half-finished cascade used to pass as done.
        const batch = await batchRegenerateArticleSeo(categoryArticles.map((a) => a.id));
        articleCascadeFailed = batch.failed;
        if (batch.failed > 0) seoFailures.push(`${batch.failed} مقالاً ما تجدّدت بياناته`);
      }
    } catch (e) {
      articleCascadeFailed = -1;
      seoFailures.push(`مقالات القسم: ${e instanceof Error ? e.message : String(e)}`);
    }

    if (articleCascadeFailed === 0) await revalidateModontyTag("articles");

    return {
      success: true,
      category,
      seoWarning:
        seoFailures.length > 0
          ? `القسم انحفظ، لكن بيانات السيو ما تجدّدت — جوجل بيبقى يشوف القديم. (${seoFailures.join(" · ")})`
          : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update category";
    return { success: false, error: message };
  }
}
