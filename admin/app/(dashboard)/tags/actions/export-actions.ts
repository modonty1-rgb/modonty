"use server";

import { db } from "@/lib/db";
import { ArticleStatus, Prisma } from "@prisma/client";
import { TagFilters } from "./tags-actions";

function escapeCsvValue(value: string | null | undefined): string {
  if (!value) return "";
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function exportTagsToCSV(filters?: TagFilters): Promise<string> {
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
          some: {
            article: {
              status: ArticleStatus.PUBLISHED,
            },
          },
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
      orderBy: { createdAt: "desc" },
    });

    let filteredTags = tags;

    if (filters?.hasArticles !== undefined || filters?.minArticleCount !== undefined || filters?.maxArticleCount !== undefined) {
      filteredTags = tags.filter((tag) => {
        const publishedArticles = tag.articles.filter((at) => at.article.status === ArticleStatus.PUBLISHED);
        const articleCount = publishedArticles.length;
        
        if (filters.hasArticles !== undefined) {
          if (filters.hasArticles && articleCount === 0) return false;
          if (!filters.hasArticles && articleCount > 0) return false;
        }
        
        if (filters.minArticleCount !== undefined && articleCount < filters.minArticleCount) {
          return false;
        }
        if (filters.maxArticleCount !== undefined && articleCount > filters.maxArticleCount) {
          return false;
        }
        return true;
      });
    }

    const headers = [
      "Name",
      "Slug",
      "Article Count",
      "Created Date",
    ];

    const csvRows = [headers.join(",")];

    for (const tag of filteredTags) {
      const publishedArticles = tag.articles.filter((at) => at.article.status === ArticleStatus.PUBLISHED);
      const row = [
        escapeCsvValue(tag.name),
        escapeCsvValue(tag.slug),
        publishedArticles.length.toString(),
        formatDate(tag.createdAt),
      ];
      csvRows.push(row.join(","));
    }

    return csvRows.join("\n");
  } catch (error) {
    console.error("Error exporting tags to CSV:", error);
    throw new Error("Failed to export tags to CSV");
  }
}
