"use server";

import { db } from "@/lib/db";

export async function getArticles() {
  try {
    return await db.article.findMany({
      where: {
        status: {
          in: ["DRAFT", "PUBLISHED", "ARCHIVED"],
        },
      },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

