"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { auth } from "@/lib/auth";
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
  cloudinaryPublicId?: string;
}) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = categoryServerSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    // Slug uniqueness check
    const existing = await db.category.findFirst({ where: { slug: data.slug.trim() }, select: { id: true } });
    if (existing) {
      return { success: false, error: "This slug is already in use. Try a different one." };
    }

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
    try {
      const { generateAndSaveCategorySeo } = await import("@/lib/seo/category-seo-generator");
      await generateAndSaveCategorySeo(category.id);
    } catch (e) { console.error("Category SEO gen failed:", e); }
    try {
      const { regenerateCategoriesListingCache } = await import("@/lib/seo/listing-page-seo-generator");
      await regenerateCategoriesListingCache();
    } catch (e) { console.error("Categories listing cache failed:", e); }
    return { success: true, category };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return { success: false, error: message };
  }
}
