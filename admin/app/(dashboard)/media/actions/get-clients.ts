"use server";

import { db } from "@/lib/db";

export async function getClients() {
  try {
    const clients = await db.client.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: "asc" },
    });
    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}
