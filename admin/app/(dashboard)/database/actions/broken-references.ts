"use server";

import { db } from "@/lib/db";

export interface BrokenRefsResult {
  articlesWithMissingAuthor: number;
  articlesWithMissingCategory: number;
  articlesWithMissingFeaturedImage: number;
  total: number;
}

export async function getBrokenReferences(): Promise<BrokenRefsResult> {
  const [allArticles, articlesWithCategory, articlesWithImage] = await Promise.all([
    db.article.findMany({ select: { id: true, authorId: true } }),
    db.article.findMany({ where: { categoryId: { not: null } }, select: { categoryId: true } }),
    db.article.findMany({ where: { featuredImageId: { not: null } }, select: { featuredImageId: true } }),
  ]);

  const uniqueAuthorIds = [...new Set(allArticles.map((a) => a.authorId))];
  const uniqueCategoryIds = [...new Set(articlesWithCategory.map((a) => a.categoryId!))];
  const uniqueImageIds = [...new Set(articlesWithImage.map((a) => a.featuredImageId!))];

  const [existingAuthors, existingCategories, existingMedia] = await Promise.all([
    db.author.findMany({ where: { id: { in: uniqueAuthorIds } }, select: { id: true } }),
    db.category.findMany({ where: { id: { in: uniqueCategoryIds } }, select: { id: true } }),
    db.media.findMany({ where: { id: { in: uniqueImageIds } }, select: { id: true } }),
  ]);

  const existingAuthorIds = new Set(existingAuthors.map((a) => a.id));
  const existingCategoryIds = new Set(existingCategories.map((c) => c.id));
  const existingMediaIds = new Set(existingMedia.map((m) => m.id));

  const articlesWithMissingAuthor = allArticles.filter(
    (a) => !existingAuthorIds.has(a.authorId)
  ).length;
  const articlesWithMissingCategory = articlesWithCategory.filter(
    (a) => !existingCategoryIds.has(a.categoryId!)
  ).length;
  const articlesWithMissingFeaturedImage = articlesWithImage.filter(
    (a) => !existingMediaIds.has(a.featuredImageId!)
  ).length;

  const total = articlesWithMissingAuthor + articlesWithMissingCategory + articlesWithMissingFeaturedImage;

  return {
    articlesWithMissingAuthor,
    articlesWithMissingCategory,
    articlesWithMissingFeaturedImage,
    total,
  };
}
