"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

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
    const authors = await db.author.findMany({
      include: {
        _count: {
          select: {
            articles: {
              where: { status: ArticleStatus.PUBLISHED },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Name",
      "Job Title",
      "Email",
      "Bio",
      "LinkedIn",
      "Twitter",
      "Expertise",
      "Experience (Years)",
      "Verified",
      "Published Articles",
      "Created Date",
    ];

    const csvRows = [headers.join(",")];

    for (const author of authors) {
      const row = [
        escapeCsvValue(author.name),
        escapeCsvValue(author.jobTitle),
        escapeCsvValue(author.email),
        escapeCsvValue(author.bio),
        escapeCsvValue(author.linkedIn),
        escapeCsvValue(author.twitter),
        escapeCsvValue(author.expertiseAreas.join(", ")),
        (author.experienceYears ?? "").toString(),
        author.verificationStatus ? "Yes" : "No",
        author._count.articles.toString(),
        formatDate(author.createdAt),
      ];
      csvRows.push(row.join(","));
    }

    return csvRows.join("\n");
  } catch {
    throw new Error("Failed to export authors");
  }
}
