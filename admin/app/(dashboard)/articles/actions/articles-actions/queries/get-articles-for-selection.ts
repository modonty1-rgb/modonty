"use server";

import { db } from "@/lib/db";
import { ArticleStatus, Prisma } from "@prisma/client";

export interface ArticleSelectionFilters {
  excludeArticleId?: string;
  categoryId?: string;
  tagIds?: string[];
  search?: string;
  status?: ArticleStatus[];
  /** Restrict to one client — a client-site article may only reference its own client. */
  clientId?: string;
  /**
   * Only articles that live on the client's own website, and only the ones already
   * live there. A draft has no page on their domain yet, so linking to it would point
   * the reader at a 404 the day the article ships.
   */
  clientSiteOnly?: boolean;
}

export interface ArticleSelectionItem {
  id: string;
  title: string;
  slug: string;
  clientName: string;
  categoryId?: string | null;
  categoryName?: string | null;
  tags: Array<{ id: string; name: string }>;
  status: ArticleStatus;
  datePublished: Date | null;
}

export async function getArticlesForSelection(
  filters?: ArticleSelectionFilters
): Promise<ArticleSelectionItem[]> {
  try {
    const where: Prisma.ArticleWhereInput = {
      ...(filters?.excludeArticleId ? { id: { not: filters.excludeArticleId } } : {}),
      ...(filters?.clientId ? { clientId: filters.clientId } : {}),
      ...(filters?.clientSiteOnly
        ? { isClientSiteArticle: true, status: ArticleStatus.PUBLISHED_ON_CLIENT_SITE }
        : filters?.status && filters.status.length > 0
          ? { status: { in: filters.status } }
          : { status: ArticleStatus.PUBLISHED, NOT: { isClientSiteArticle: true } }),
      ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters?.tagIds && filters.tagIds.length > 0
        ? {
            tags: {
              some: {
                tagId: { in: filters.tagIds },
              },
            },
          }
        : {}),
      ...(filters?.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" } },
              { slug: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const articles = await db.article.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        datePublished: true,
        categoryId: true,
        client: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 500,
    });

    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      clientName: article.client.name,
      categoryId: article.categoryId,
      categoryName: article.category?.name ?? null,
      tags: article.tags.map((tagRelation) => ({
        id: tagRelation.tag.id,
        name: tagRelation.tag.name,
      })),
      status: article.status,
      datePublished: article.datePublished,
    }));
  } catch (error) {
    console.error("Error fetching articles for selection:", error);
    return [];
  }
}

