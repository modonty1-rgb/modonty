"use server";

import { db } from "@/lib/db";
import { NOT_ARCHIVED } from "@modonty/shared/lib/taxonomy/not-archived";

export async function getCategories() {
  try {
    return await db.category.findMany({ where: NOT_ARCHIVED,
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

