import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { SubscriptionStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import type { IndustryListItem, IndustryQueryOptions } from "@/lib/types";

export async function getIndustriesWithCounts() {
  const industries = await db.industry.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      socialImage: true,
      socialImageAlt: true,
      _count: { select: { clients: { where: { subscriptionStatus: SubscriptionStatus.ACTIVE } } } },
    },
    orderBy: { name: "asc" },
  });

  return industries
    .filter(i => i._count.clients > 0)
    .map(i => ({
      id: i.id,
      name: i.name,
      slug: i.slug,
      description: i.description,
      socialImage: i.socialImage,
      socialImageAlt: i.socialImageAlt,
      clientCount: i._count.clients,
    }));
}
