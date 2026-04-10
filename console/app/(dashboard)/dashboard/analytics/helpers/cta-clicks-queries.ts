import { db } from "@/lib/db";
import type { CTAType } from "@prisma/client";

export interface CTAClickData {
  type: CTAType;
  label: string | null;
  clicks: number;
  percentage: number;
}

export async function getTopCTAClicks(
  clientId: string,
  days: 7 | 30 | 90 = 30,
  limit: number = 10
): Promise<{ items: CTAClickData[]; total: number }> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db.cTAClick.groupBy({
    by: ["type", "label"],
    where: {
      clientId,
      createdAt: { gte: since },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  const total = rows.reduce((sum, r) => sum + r._count.id, 0);

  return {
    items: rows.map((r) => ({
      type: r.type,
      label: r.label,
      clicks: r._count.id,
      percentage: total > 0 ? (r._count.id / total) * 100 : 0,
    })),
    total,
  };
}
