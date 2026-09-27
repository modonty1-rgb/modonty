"use server";

import { SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";

export async function getClients(options?: { anyStatus?: boolean }) {
  try {
    const clients = await db.client.findMany({
      // Only ACTIVE clients appear in the media library selector. Clients › Media uploads for
      // any client (an expired client's missing mobile cover is still a real gap on its page).
      where: options?.anyStatus ? {} : { subscriptionStatus: SubscriptionStatus.ACTIVE },
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
