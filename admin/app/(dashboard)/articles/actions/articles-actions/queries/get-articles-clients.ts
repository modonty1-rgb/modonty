"use server";

import { db } from "@/lib/db";

export async function getClients() {
  try {
    return await db.client.findMany({
      include: {
        logoMedia: true,
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

