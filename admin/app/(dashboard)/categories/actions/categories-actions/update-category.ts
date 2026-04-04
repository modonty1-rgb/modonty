"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

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
    cloudinaryPublicId?: string | null;
  },
) {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

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
      cloudinaryPublicId?: string | null;
    } = {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      parentId: data.parentId || null,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      canonicalUrl: data.canonicalUrl || null,
    };

    if (data.socialImage !== undefined) {
      updateData.socialImage = data.socialImage;
    }
    if (data.socialImageAlt !== undefined) {
      updateData.socialImageAlt = data.socialImageAlt;
    }
    if (data.cloudinaryPublicId !== undefined) {
      updateData.cloudinaryPublicId = data.cloudinaryPublicId;
    }

    const category = await db.category.update({
      where: isObjectId ? { id } : { slug: id },
      data: updateData,
    });
    revalidatePath("/categories");
    await revalidateModontyTag("categories");
    try {
      const { generateAndSaveCategorySeo } = await import("@/lib/seo/category-seo-generator");
      await generateAndSaveCategorySeo(category.id);
      const { regenerateCategoriesListingCache } = await import("@/lib/seo/listing-page-seo-generator");
      await regenerateCategoriesListingCache();
    } catch (e) { console.error("Category SEO gen failed:", e); }
    return { success: true, category };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update category";
    return { success: false, error: message };
  }
}

