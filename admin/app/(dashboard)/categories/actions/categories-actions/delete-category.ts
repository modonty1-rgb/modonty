"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteOldImage } from "../../../actions/delete-image";

export async function deleteCategory(id: string) {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    const category = await db.category.findUnique({
      where: isObjectId ? { id } : { slug: id },
      include: {
        _count: {
          select: {
            articles: true,
            children: true,
          },
        },
      },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    if (category._count.articles > 0 || category._count.children > 0) {
      const errors: string[] = [];
      if (category._count.articles > 0) {
        errors.push(`${category._count.articles} article(s)`);
      }
      if (category._count.children > 0) {
        errors.push(
          `${category._count.children} child categor${
            category._count.children === 1 ? "y" : "ies"
          }`,
        );
      }
      return {
        success: false,
        error: `Cannot delete category. This category has ${errors.join(
          " and ",
        )}. Please delete or reassign them first.`,
      };
    }

    await deleteOldImage("categories", category.id);

    await db.category.delete({ where: { id: category.id } });
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    const message = error instanceof Error ? error.message : "Failed to delete category";
    return { success: false, error: message };
  }
}

