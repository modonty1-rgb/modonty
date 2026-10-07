"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { formatDate } from "@/lib/csv/format-date";
import { escapeCsv } from "../helpers/escape-csv";

export async function exportAnalyticsToCSV(): Promise<string> {
  try {
    const articles = await db.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      select: {
        id: true,
        title: true,
        datePublished: true,
        client: { select: { name: true } },
        category: { select: { name: true } },
        author: { select: { name: true } },
        _count: {
          select: {
            views: true,
            likes: true,
            dislikes: true,
            favorites: true,
            shares: true,
            comments: true,
          },
        },
      },
      orderBy: { datePublished: "desc" },
    });

    const headers = [
      "Title",
      "Client",
      "Category",
      "Author",
      "Published",
      "Views",
      "Likes",
      "Dislikes",
      "Favorites",
      "Shares",
      "Comments",
    ];

    const rows = articles.map((a) => [
      escapeCsv(a.title),
      escapeCsv(a.client?.name),
      escapeCsv(a.category?.name),
      escapeCsv(a.author?.name),
      escapeCsv(formatDate(a.datePublished)),
      a._count.views,
      a._count.likes,
      a._count.dislikes,
      a._count.favorites,
      a._count.shares,
      a._count.comments,
    ].join(","));

    return [headers.join(","), ...rows].join("\n");
  } catch {
    throw new Error("Could not generate the performance report.");
  }
}
