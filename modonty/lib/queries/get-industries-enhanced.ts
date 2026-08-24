import { mediaSrc } from "@modonty/shared/lib/media-src";
// Uncached shared reader — this body runs inside `unstable_cache`, not a `"use cache"` scope.
import { getCoreClientId } from "@modonty/shared/lib/core-client";
import { db } from "@/lib/db";
import { SubscriptionStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import type { IndustryListItem, IndustryQueryOptions } from "@/lib/types";

/**
 * Listing-page data. Industries relate to clients DIRECTLY (Client.industryId), so a
 * single query gives both the ACTIVE-partner count and the top-3 avatars — no articles
 * junction, no N+1, and (unlike categories/tags) no GA4 call: the digital-impact block
 * is hidden on the card today, and performance is the #1 rule for the visitor site.
 * Empty industries (0 active partners) are hidden.
 */
export const getIndustriesEnhanced = unstable_cache(
  async (options: IndustryQueryOptions = {}): Promise<IndustryListItem[]> => {
    const { search, sortBy = "clients" } = options;

    // Modonty holds a Client row of its own; counting it here would list the platform among
    // the partners of its own industry tile. `Settings.coreClientId` is the only switch.
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
        _count: {
          select: { clients: { where: activePartner } },
        },
        clients: {
          where: activePartner,
          orderBy: { name: "asc" },
          take: 3,
          select: {
            id: true,
            name: true,
            logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    let results: IndustryListItem[] = industries
      .filter((industry) => industry._count.clients > 0)
      .map((industry) => ({
        id: industry.id,
        name: industry.name,
        slug: industry.slug,
        description: industry.description || undefined,
        socialImage: industry.socialImage || undefined,
        socialImageAlt: industry.socialImageAlt || undefined,
        clientCount: industry._count.clients,
        clientPreviews: industry.clients.map((client) => ({
          id: client.id,
          name: client.name,
          logoUrl: mediaSrc(client.logoMedia) ?? undefined,
        })),
      }));

    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(
        (industry) =>
          industry.name.toLowerCase().includes(searchLower) ||
          industry.description?.toLowerCase().includes(searchLower)
      );
    }

    if (sortBy === "name") {
      results.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    } else {
      results.sort((a, b) => b.clientCount - a.clientCount);
    }

    return results;
  },
  ["industries-enhanced"],
  { revalidate: 3600, tags: ["industries", "clients"] }
);
