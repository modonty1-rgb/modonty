"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { deleteOldImage } from "../../../actions/delete-image";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";

export async function deleteCategory(id: string) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };
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

    await logAction("category.delete", {
      entity: "Category",
      entityId: category.id,
      summary: category.name,
      metadata: { slug: category.slug },
    });

    revalidatePath("/categories");

    // Rebuild the listing blob BEFORE busting modonty's cache. It was the other way round,
    // so the flush went out first and the next visitor rebuilt /categories from the blob
    // that still listed the deleted category — the stale page served under a fresh cache.
    // Same order the create and update paths already follow.
    //
    // And the answer is read: the generator returns `{ success, error }` and never throws,
    // so `await` alone always looked successful. A failed rebuild holds the flush rather
    // than publishing the old list as new.
    let listingOk = true;
    try {
      const { regenerateCategoriesListingCache } = await import("@/lib/seo/listing-page-seo-generator");
      const r = await regenerateCategoriesListingCache();
      listingOk = r.success;
      if (!r.success) console.error("Categories listing cache failed:", r.error);
    } catch (e) {
      listingOk = false;
      console.error("Categories listing cache failed:", e);
    }
    if (listingOk) await revalidateModontyTag("categories");

    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    const message = error instanceof Error ? error.message : "Failed to delete category";
    return { success: false, error: message };
  }
}

