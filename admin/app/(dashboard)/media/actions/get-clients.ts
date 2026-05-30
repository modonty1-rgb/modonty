"use server";

import { SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";

export async function getClients() {
  try {
    const clients = await db.client.findMany({
      // Only ACTIVE clients appear in the media library selector.
      where: { subscriptionStatus: SubscriptionStatus.ACTIVE },
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
