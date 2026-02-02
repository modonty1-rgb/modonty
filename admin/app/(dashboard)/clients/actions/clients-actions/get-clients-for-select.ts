"use server";

import { db } from "@/lib/db";

export async function getClientsForSelect(excludeId?: string) {
  try {
    const clients = await db.client.findMany({
      where: excludeId ? { id: { not: excludeId } } : undefined,
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: "asc" },
    });

    return clients;
  } catch (error) {
    console.error("Error fetching clients for select:", error);
    return [];
  }
}
