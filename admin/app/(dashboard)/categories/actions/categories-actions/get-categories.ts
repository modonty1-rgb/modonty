"use server";

import { db } from "@/lib/db";
import { Prisma, ArticleStatus } from "@prisma/client";
import { computeReferenceSeoScore } from "@modonty/database/lib/seo/reference/seo-score";
import type { JsonLdValidationReport } from "@modonty/database/lib/seo/client/types";

export interface CategoryFilters {
  createdFrom?: Date;
  createdTo?: Date;
  minArticleCount?: number;
  maxArticleCount?: number;
  hasArticles?: boolean;
  search?: string;
  parentId?: string;
}

export async function getCategories(filters?: CategoryFilters) {
  try {
    const where: Prisma.CategoryWhereInput = {};

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
          some: {
            status: ArticleStatus.PUBLISHED,
          },
        };
      } else {
        where.articles = {
          none: {},
        };
      }
    }

    if (filters?.parentId !== undefined) {
      where.parentId = filters.parentId || null;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { slug: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const categories = await db.category.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        createdAt: true,
        jsonLdLastGenerated: true,
        parent: { select: { name: true } },
        _count: { select: { articles: true } },
        // Read by the shared reference scorer (stripped before returning to the client).
        nextjsMetadata: true,
        jsonLdStructuredData: true,
        jsonLdValidationReport: true,
      },
      orderBy: { name: "asc" },
    });

    let filteredCategories = categories;

    if (filters?.minArticleCount !== undefined || filters?.maxArticleCount !== undefined) {
      filteredCategories = categories.filter((category) => {
        const articleCount = category._count.articles;
        if (filters.minArticleCount !== undefined && articleCount < filters.minArticleCount) {
          return false;
        }
        if (filters.maxArticleCount !== undefined && articleCount > filters.maxArticleCount) {
          return false;
        }
        return true;
      });
    }

    // Compute the SEO score from the shared reference scorer, then strip the heavy
    // metadata so only the number reaches the client table.
    return filteredCategories.map(
      ({ nextjsMetadata, jsonLdStructuredData, jsonLdValidationReport, ...rest }) => ({
        ...rest,
        seoScore: computeReferenceSeoScore({
          name: rest.name,
          nextjsMetadata,
          jsonLdStructuredData,
          jsonLdValidationReport: (jsonLdValidationReport ?? null) as JsonLdValidationReport | null,
        }).score,
      }),
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

