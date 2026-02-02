/**
 * Industry database query helpers
 * Used by API routes and Server Components
 */

import { db } from "@/lib/db";

export async function getIndustriesWithCounts() {
  const industries = await db.industry.findMany({
    include: {
      _count: { select: { clients: true } },
    },
    orderBy: { name: "asc" },
  });

  return industries
    .filter(i => i._count.clients > 0)
    .map(i => ({
      id: i.id,
      name: i.name,
      slug: i.slug,
      clientCount: i._count.clients
    }));
}
