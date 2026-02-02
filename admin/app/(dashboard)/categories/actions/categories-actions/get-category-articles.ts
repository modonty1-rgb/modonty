"use server";

import { db } from "@/lib/db";

export async function getCategoryArticles(categoryId: string) {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryId);

    let actualCategoryId = categoryId;
    if (!isObjectId) {
      const category = await db.category.findUnique({
        where: { slug: categoryId },
        select: { id: true },
      });
      if (!category) {
        return [];
      }
      actualCategoryId = category.id;
    }

    const { getArticles } = await import("@/app/(dashboard)/articles/actions/articles-actions");
    return await getArticles({ categoryId: actualCategoryId });
  } catch (error) {
    console.error("Error fetching category articles:", error);
    return [];
  }
}

