"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { deleteOldImage } from "../../actions/delete-image";
import { Prisma, ArticleStatus } from "@prisma/client";
import { calculateSEOScore } from "@/helpers/utils/seo-score-calculator";
import { tagSEOConfig } from "../helpers/tag-seo-config";

export interface TagFilters {
  createdFrom?: Date;
  createdTo?: Date;
  minArticleCount?: number;
  maxArticleCount?: number;
  hasArticles?: boolean;
  search?: string;
}

export async function getTags(filters?: TagFilters) {
  try {
    const where: Prisma.TagWhereInput = {};

    if (filters?.createdFrom || filters?.createdTo) {
      where.createdAt = {};
      if (filters.createdFrom) {
        where.createdAt.gte = filters.createdFrom;
      }
      if (filters.createdTo) {
        where.createdAt.lte = filters.createdTo;
      }
    }

    if (filters?.hasArticles !== undefined) {
      if (filters.hasArticles) {
        where.articles = {
          some: {},
        };
      } else {
        where.articles = {
          none: {},
        };
      }
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { slug: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const tags = await db.tag.findMany({
      where,
      include: {
        _count: { select: { articles: true } },
      },
      orderBy: { name: "asc" },
    });

    let filteredTags = tags;

    if (filters?.minArticleCount !== undefined || filters?.maxArticleCount !== undefined) {
      filteredTags = tags.filter((tag) => {
        const articleCount = tag._count.articles;
        if (filters.minArticleCount !== undefined && articleCount < filters.minArticleCount) {
          return false;
        }
        if (filters.maxArticleCount !== undefined && articleCount > filters.maxArticleCount) {
          return false;
        }
        return true;
      });
    }

    return filteredTags;
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}

export async function getTagById(id: string) {
  try {
    return await db.tag.findUnique({
      where: { id },
      include: {
        articles: {
          include: {
            article: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    return null;
  }
}

export async function getTagArticles(tagId: string) {
  try {
    const { getArticles } = await import("@/app/(dashboard)/articles/actions/articles-actions");
    const articles = await getArticles();
    const tag = await db.tag.findUnique({
      where: { id: tagId },
      include: {
        articles: {
          include: {
            article: true,
          },
        },
      },
    });
    
    if (!tag) return [];
    
    const articleIds = tag.articles.map((at) => at.articleId);
    return articles.filter((article) => articleIds.includes(article.id));
  } catch (error) {
    console.error("Error fetching tag articles:", error);
    return [];
  }
}

export async function createTag(data: {
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  socialImage?: string;
  socialImageAlt?: string;
  cloudinaryPublicId?: string;
}) {
  try {
    if (!data.name?.trim()) return { success: false, error: "اسم التاج مطلوب" };
    if (!data.slug?.trim()) return { success: false, error: "الرابط المختصر مطلوب" };

    const tag = await db.tag.create({ data });
    revalidatePath("/tags");
    await revalidateModontyTag("tags");
    try { const { generateAndSaveTagSeo } = await import("@/lib/seo/tag-seo-generator"); await generateAndSaveTagSeo(tag.id); } catch (e) { console.error("Tag SEO gen failed:", e); }
    try { const { regenerateTagsListingCache } = await import("@/lib/seo/listing-page-seo-generator"); await regenerateTagsListingCache(); } catch (e) { console.error("Tags listing cache failed:", e); }
    return { success: true, tag };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create tag";
    return { success: false, error: message };
  }
}

export async function updateTag(
  id: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    socialImage?: string | null;
    socialImageAlt?: string | null;
    cloudinaryPublicId?: string | null;
  }
) {
  try {
    const updateData: {
      name: string;
      slug: string;
      description?: string | null;
      seoTitle?: string | null;
      seoDescription?: string | null;
      canonicalUrl?: string | null;
      socialImage?: string | null;
      socialImageAlt?: string | null;
      cloudinaryPublicId?: string | null;
    } = {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      canonicalUrl: data.canonicalUrl || null,
    };

    // Only update socialImage fields if they are explicitly provided (including null for removal)
    if (data.socialImage !== undefined) {
      updateData.socialImage = data.socialImage;
    }
    if (data.socialImageAlt !== undefined) {
      updateData.socialImageAlt = data.socialImageAlt;
    }
    if (data.cloudinaryPublicId !== undefined) {
      updateData.cloudinaryPublicId = data.cloudinaryPublicId;
    }

    const tag = await db.tag.update({ where: { id }, data: updateData });
    revalidatePath("/tags");
    await revalidateModontyTag("tags");
    try { const { generateAndSaveTagSeo } = await import("@/lib/seo/tag-seo-generator"); await generateAndSaveTagSeo(tag.id); } catch (e) { console.error("Tag SEO gen failed:", e); }
    try { const { regenerateTagsListingCache } = await import("@/lib/seo/listing-page-seo-generator"); await regenerateTagsListingCache(); } catch (e) { console.error("Tags listing cache failed:", e); }
    return { success: true, tag };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update tag";
    return { success: false, error: message };
  }
}

export async function deleteTag(id: string) {
  try {
    const tag = await db.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
    });

    if (!tag) {
      return { success: false, error: "Tag not found" };
    }

    if (tag._count.articles > 0) {
      return {
        success: false,
        error: `Cannot delete tag. This tag has ${tag._count.articles} article(s). Please delete or reassign the articles first.`,
      };
    }

    // Delete Cloudinary image before database deletion (non-blocking)
    await deleteOldImage("tags", id);

    await db.tag.delete({ where: { id } });
    revalidatePath("/tags");
    await revalidateModontyTag("tags");
    try { const { regenerateTagsListingCache } = await import("@/lib/seo/listing-page-seo-generator"); await regenerateTagsListingCache(); } catch (e) { console.error("Tags listing cache failed:", e); }
    return { success: true };
  } catch (error) {
    console.error("Error deleting tag:", error);
    const message = error instanceof Error ? error.message : "Failed to delete tag";
    return { success: false, error: message };
  }
}

export async function getTagsStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, withArticles, withoutArticles, createdThisMonth, allTags] =
      await Promise.all([
        db.tag.count(),
        db.tag.count({
          where: {
            articles: {
              some: {},
            },
          },
        }),
        db.tag.count({
          where: {
            articles: {
              none: {},
            },
          },
        }),
        db.tag.count({
          where: {
            createdAt: { gte: startOfMonth },
          },
        }),
        db.tag.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            seoTitle: true,
            seoDescription: true,
            canonicalUrl: true,
          },
        }),
      ]);

    let averageSEO = 0;
    if (allTags.length > 0) {
      const scores = allTags.map((tag) => {
        const scoreResult = calculateSEOScore(tag, tagSEOConfig);
        return scoreResult.percentage;
      });
      averageSEO = Math.round(
        scores.reduce((sum, score) => sum + score, 0) / scores.length
      );
    }

    return {
      total,
      withArticles,
      withoutArticles,
      createdThisMonth,
      averageSEO,
    };
  } catch (error) {
    console.error("Error fetching tags stats:", error);
    return {
      total: 0,
      withArticles: 0,
      withoutArticles: 0,
      createdThisMonth: 0,
      averageSEO: 0,
    };
  }
}

