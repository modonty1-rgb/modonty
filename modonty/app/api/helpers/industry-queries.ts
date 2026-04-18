/**
 * Industry database query helpers
 * Used by API routes and Server Components
 */

import { db } from "@/lib/db";
import { SubscriptionStatus } from "@prisma/client";

export async function getIndustriesWithCounts() {
  const industries = await db.industry.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      socialImage: true,
      socialImageAlt: true,
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
      description: i.description,
      socialImage: i.socialImage,
      socialImageAlt: i.socialImageAlt,
      clientCount: i._count.clients,
    }));
}

export async function getIndustryBySlug(slug: string) {
  return db.industry.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      socialImage: true,
      socialImageAlt: true,
      clients: {
        where: { subscriptionStatus: SubscriptionStatus.ACTIVE },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          logoMedia: { select: { url: true } },
          description: true,
          slogan: true,
          _count: { select: { articles: true } },
        },
      },
    },
  });
}
