"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface StaleVersionsStats {
  stale90Days: number;
  stale30Days: number;
}

export async function getStaleVersionsStats(): Promise<StaleVersionsStats> {
  const cutoff90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const cutoff30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [stale90Days, stale30Days] = await Promise.all([
    db.articleVersion.count({ where: { createdAt: { lt: cutoff90 } } }),
    db.articleVersion.count({ where: { createdAt: { lt: cutoff30 } } }),
  ]);
  return { stale90Days, stale30Days };
}

export async function cleanStaleVersions(days: number): Promise<{ deleted: number }> {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const result = await db.articleVersion.deleteMany({ where: { createdAt: { lt: cutoff } } });
  revalidatePath("/database");
  return { deleted: result.count };
}
