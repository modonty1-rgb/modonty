"use server";

import { db } from "@/lib/db";

export async function getCategoryById(id: string) {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    return await db.category.findUnique({
      where: isObjectId ? { id } : { slug: id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        seoTitle: true,
        seoDescription: true,
        socialImage: true,
        socialImageAlt: true,
        canonicalUrl: true,
        createdAt: true,
        updatedAt: true,
        nextjsMetadata: true,
        nextjsMetadataLastGenerated: true,
        jsonLdStructuredData: true,
        jsonLdLastGenerated: true,
        parent: { select: { id: true, name: true } },
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

