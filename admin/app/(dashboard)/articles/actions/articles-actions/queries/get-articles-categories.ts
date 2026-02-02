"use server";

import { db } from "@/lib/db";

export async function getCategories() {
  try {
    return await db.category.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

