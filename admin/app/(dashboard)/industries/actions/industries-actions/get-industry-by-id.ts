"use server";

import { db } from "@/lib/db";

export async function getIndustryById(id: string) {
  try {
    return await db.industry.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            clients: true,
          },
        },
      },
    });
  } catch (error) {
    return null;
  }
}
