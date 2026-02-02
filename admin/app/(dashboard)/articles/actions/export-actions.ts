"use server";

import { db } from "@/lib/db";
import { ArticleStatus, Prisma } from "@prisma/client";
import { ArticleFilters } from "./articles-actions";

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

export async function exportArticlesToCSV(filters?: ArticleFilters): Promise<string> {
  try {
    const validStatuses = [
      ArticleStatus.WRITING,
      ArticleStatus.DRAFT,
      ArticleStatus.SCHEDULED,
      ArticleStatus.PUBLISHED,
      ArticleStatus.ARCHIVED,
    ];
    
    const where: Prisma.ArticleWhereInput = {};

    if (filters?.status && validStatuses.includes(filters.status)) {
      where.status = filters.status;
    } else {
      where.status = { in: validStatuses };
    }

    if (filters?.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.authorId) {
      where.authorId = filters.authorId;
    }

    if (filters?.createdFrom || filters?.createdTo) {
      where.createdAt = {};
      if (filters.createdFrom) {
        where.createdAt.gte = filters.createdFrom;
      }
      if (filters.createdTo) {
        where.createdAt.lte = filters.createdTo;
      }
    }

    if (filters?.publishedFrom || filters?.publishedTo) {
      where.datePublished = {};
      if (filters.publishedFrom) {
        where.datePublished.gte = filters.publishedFrom;
      }
      if (filters.publishedTo) {
        where.datePublished.lte = filters.publishedTo;
      }
    }

    const articles = await db.article.findMany({
      where,
      include: {
        client: { select: { name: true } },
        category: { select: { name: true } },
        author: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const articleIds = articles.map((a) => a.id);
    let viewsMap = new Map<string, number>();

    if (articleIds.length > 0) {
      const viewsCounts = await db.analytics.groupBy({
        by: ["articleId"],
        where: {
          articleId: { in: articleIds },
        },
        _count: {
          id: true,
        },
      });
      viewsMap = new Map(viewsCounts.map((v) => [v.articleId, v._count.id]));
    }

    // CSV Header
    const headers = [
      "Title",
      "Status",
      "Client",
      "Category",
      "Author",
      "Views",
      "Created Date",
      "Published Date",
      "Scheduled Date",
    ];

    const csvRows = [headers.join(",")];

    // CSV Rows
    for (const article of articles) {
      const views = viewsMap.get(article.id) || 0;
      const row = [
        escapeCsvValue(article.title),
        escapeCsvValue(article.status),
        escapeCsvValue(article.client?.name),
        escapeCsvValue(article.category?.name),
        escapeCsvValue("Modonty"),
        views.toString(),
        formatDate(article.createdAt),
        formatDate(article.datePublished),
        formatDate(article.scheduledAt),
      ];
      csvRows.push(row.join(","));
    }

    return csvRows.join("\n");
  } catch (error) {
    console.error("Error exporting articles to CSV:", error);
    throw new Error("Failed to export articles to CSV");
  }
}
