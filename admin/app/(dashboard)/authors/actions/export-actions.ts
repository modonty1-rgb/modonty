"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { MODONTY_AUTHOR_SLUG } from "@/lib/constants/modonty-author";

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

export async function exportAuthorsToCSV(): Promise<string> {
  try {
    const modontyAuthor = await db.author.findUnique({
      where: { slug: MODONTY_AUTHOR_SLUG },
      include: {
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
    });

    if (!modontyAuthor) {
      const headers = ["Name", "Slug", "Job Title", "Article Count", "Created Date"];
      return headers.join(",") + "\n";
    }

    const headers = [
      "Name",
      "Slug",
      "Job Title",
      "Article Count",
      "Created Date",
    ];

    const csvRows = [headers.join(",")];

    const row = [
      escapeCsvValue(modontyAuthor.name),
      escapeCsvValue(modontyAuthor.slug),
      escapeCsvValue(modontyAuthor.jobTitle),
      modontyAuthor._count.articles.toString(),
      formatDate(modontyAuthor.createdAt),
    ];
    csvRows.push(row.join(","));

    return csvRows.join("\n");
  } catch (error) {
    console.error("Error exporting authors to CSV:", error);
    throw new Error("Failed to export authors to CSV");
  }
}
