"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
    return { success: true, category };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return { success: false, error: message };
  }
}

