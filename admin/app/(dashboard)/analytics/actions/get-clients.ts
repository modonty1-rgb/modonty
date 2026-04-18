"use server";

import { db } from "@/lib/db";

export async function getClients() {
  try {
    return await db.client.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 1000,
    });
  } catch (error) {
    return [];
  }
}

