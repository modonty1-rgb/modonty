"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { deleteOldImage } from "../../../actions/delete-image";

export async function bulkDeleteCategories(categoryIds: string[]) {
  try {
    if (categoryIds.length === 0) {
      return { success: false, error: "No categories selected" };
    }

    const objectIds = categoryIds.filter((id) => /^[0-9a-fA-F]{24}$/.test(id));
    const slugs = categoryIds.filter((id) => !/^[0-9a-fA-F]{24}$/.test(id));

    const orConditions: Prisma.CategoryWhereInput[] = [];
    if (objectIds.length > 0) {
      orConditions.push({ id: { in: objectIds } });
    }
    if (slugs.length > 0) {
      orConditions.push({ slug: { in: slugs } });
    }

    if (orConditions.length === 0) {
      return { success: false, error: "No valid category identifiers provided" };
    }

    const where: Prisma.CategoryWhereInput = {
      OR: orConditions,
    };

    const categories = await db.category.findMany({
      where,
      include: {
        _count: {
          select: {
            articles: true,
            children: true,
          },
        },
      },
    });

    const categoriesWithDependencies = categories.filter(
      (category) => category._count.articles > 0 || category._count.children > 0,
    );

    if (categoriesWithDependencies.length > 0) {
      const categoryNames = categoriesWithDependencies.map((c) => c.name).join(", ");
      const totalArticles = categoriesWithDependencies.reduce(
        (sum, c) => sum + c._count.articles,
        0,
      );
      const totalChildren = categoriesWithDependencies.reduce(
        (sum, c) => sum + c._count.children,
        0,
      );
      return {
        success: false,
        error: `Cannot delete ${categoriesWithDependencies.length} categor${
          categoriesWithDependencies.length === 1 ? "y" : "ies"
        } with dependencies: ${categoryNames}. Total articles: ${totalArticles}, Total child categories: ${totalChildren}. Please delete or reassign the dependencies first.`,
      };
    }

    for (const category of categories) {
      await deleteOldImage("categories", category.id);
    }

    const actualIds = categories.map((c) => c.id);
    await db.category.deleteMany({
      where: {
        id: { in: actualIds },
      },
    });

    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting categories:", error);
    const message = error instanceof Error ? error.message : "Failed to delete categories";
    return { success: false, error: message };
  }
}

