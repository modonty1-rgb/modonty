"use server";

import { SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";

export async function getClients() {
  try {
    return await db.client.findMany({
      // Only ACTIVE clients can have articles written for them.
      where: { subscriptionStatus: SubscriptionStatus.ACTIVE },
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

