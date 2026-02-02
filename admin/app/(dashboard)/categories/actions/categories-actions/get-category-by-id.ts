"use server";

import { db } from "@/lib/db";

export async function getCategoryById(id: string) {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    return await db.category.findUnique({
      where: isObjectId ? { id } : { slug: id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            articles: true,
            children: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

