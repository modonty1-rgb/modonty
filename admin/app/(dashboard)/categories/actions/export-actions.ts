"use server";

import { db } from "@/lib/db";
import { ArticleStatus, Prisma } from "@prisma/client";
import { CategoryFilters } from "./categories-actions";

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

export async function exportCategoriesToCSV(filters?: CategoryFilters): Promise<string> {
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

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { slug: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const categories = await db.category.findMany({
      where,
      include: {
        parent: { select: { name: true } },
        _count: {
          select: {
            articles: {
              where: {
                status: ArticleStatus.PUBLISHED,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
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

    const headers = [
      "Name",
      "Slug",
      "Parent",
      "Article Count",
      "Created Date",
    ];

    const csvRows = [headers.join(",")];

    for (const category of filteredCategories) {
      const row = [
        escapeCsvValue(category.name),
        escapeCsvValue(category.slug),
        escapeCsvValue(category.parent?.name),
        category._count.articles.toString(),
        formatDate(category.createdAt),
      ];
      csvRows.push(row.join(","));
    }

    return csvRows.join("\n");
  } catch (error) {
    console.error("Error exporting categories to CSV:", error);
    throw new Error("Failed to export categories to CSV");
  }
}
