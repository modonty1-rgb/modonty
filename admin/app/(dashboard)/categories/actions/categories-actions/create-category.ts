"use server";

import { db } from "@/lib/db";
import { buildTaxonomyCanonical } from "@/lib/seo/build-taxonomy-canonical";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";
import { categoryServerSchema } from "./category-server-schema";

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  socialImage?: string;
  socialImageAlt?: string;
  socialImageMediaId?: string;
  cloudinaryPublicId?: string;
}) {
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

    // Slug uniqueness check
    const existing = await db.category.findFirst({ where: { slug: normalizedData.slug }, select: { id: true } });
    if (existing) {
      return { success: false, error: "This slug is already in use. Try a different one." };
    }

    const category = await db.category.create({
      data: {
        name: normalizedData.name,
        slug: normalizedData.slug,
        description: normalizedData.description,
        parentId: normalizedData.parentId || null,
        seoTitle: normalizedData.seoTitle,
        seoDescription: normalizedData.seoDescription,
        // Derived from the slug, exactly as the update path does — a category created with an
        // empty (or hand-typed) canonical used to keep it until someone noticed.
        canonicalUrl: await buildTaxonomyCanonical("categories", normalizedData.slug),
        socialImage: normalizedData.socialImage,
        socialImageAlt: normalizedData.socialImageAlt,
        socialImageMediaId: normalizedData.socialImageMediaId || null,
        cloudinaryPublicId: normalizedData.cloudinaryPublicId,
      },
    });
    await logAction("category.create", {
      entity: "Category",
      entityId: category.id,
      summary: category.name,
    });

    revalidatePath("/categories");
    // Generate BEFORE revalidating modonty — it renders the stored blob, so rebuilding
    // first serves the page without one. Same order as update-category.ts.
    // Both generators RETURN { success, error } and never throw: read the result or the
    // failure is invisible.
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

    return {
      success: true,
      category,
      seoWarning:
        seoFailures.length > 0
          ? `القسم انحفظ، لكن بيانات السيو ما تجدّدت — جوجل بيبقى يشوف القديم. (${seoFailures.join(" · ")})`
          : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return { success: false, error: message };
  }
}
