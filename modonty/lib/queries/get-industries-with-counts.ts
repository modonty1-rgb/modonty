import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { getCoreClientId } from "@/lib/settings/get-core-client-id";
import { SubscriptionStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import type { IndustryListItem, IndustryQueryOptions } from "@/lib/types";

export async function getIndustriesWithCounts() {
  // Modonty is the platform, not a partner inside its own industry tile — same exclusion the
  // partner list and the platform counters already apply.
  const coreClientId = await getCoreClientId();
  const activePartner = {
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    ...(coreClientId ? { id: { not: coreClientId } } : {}),
  };

  const industries = await db.industry.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      socialImage: true,
      socialImageAlt: true,
      _count: { select: { clients: { where: activePartner } } },
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
