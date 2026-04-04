"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

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
  cloudinaryPublicId?: string;
}) {
  try {
    if (!data.name?.trim()) return { success: false, error: "اسم التصنيف مطلوب" };
    if (!data.slug?.trim()) return { success: false, error: "الرابط المختصر مطلوب" };

    const category = await db.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        parentId: data.parentId || null,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        canonicalUrl: data.canonicalUrl,
        socialImage: data.socialImage,
        socialImageAlt: data.socialImageAlt,
        cloudinaryPublicId: data.cloudinaryPublicId,
      },
    });
    revalidatePath("/categories");
    await revalidateModontyTag("categories");
    // Generate individual SEO cache
    try {
      const { generateAndSaveCategorySeo } = await import("@/lib/seo/category-seo-generator");
      await generateAndSaveCategorySeo(category.id);
    } catch (e) { console.error("Category SEO gen failed:", e); }
    // Update listing page cache
    try {
      const { regenerateCategoriesListingCache } = await import("@/lib/seo/listing-page-seo-generator");
      await regenerateCategoriesListingCache();
    } catch (e) { console.error("Categories listing cache failed:", e); }
    return { success: true, category };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";

    // Handle duplicate slug
    if (message.includes("Unique constraint") && message.includes("slug")) {
      return {
        success: false,
        error: "اسم التصنيف مستخدم مسبقاً — جرب اسماً مختلفاً أو أضف كلمة إضافية"
      };
    }

    return { success: false, error: message };
  }
}

