"use server";

import { db } from "@/lib/db";

export async function getIndustryClients(industryId: string) {
  try {
    return await db.client.findMany({
      where: {
        industryId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching industry clients:", error);
    return [];
  }
}
