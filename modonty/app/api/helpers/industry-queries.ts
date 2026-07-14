/**
 * Industry database query helpers
 * Used by API routes and Server Components
 */

import { db } from "@/lib/db";
import { SubscriptionStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import type { IndustryListItem, IndustryQueryOptions } from "@/lib/types";

const INDUSTRIES_PAGE_SIZE = 20;

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

    const industries = await db.industry.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        socialImage: true,
        socialImageAlt: true,
        _count: {
          select: { clients: { where: { subscriptionStatus: SubscriptionStatus.ACTIVE } } },
        },
        clients: {
          where: { subscriptionStatus: SubscriptionStatus.ACTIVE },
          orderBy: { name: "asc" },
          take: 3,
          select: {
            id: true,
            name: true,
            logoMedia: { select: { url: true } },
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
          logoUrl: client.logoMedia?.url,
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

export async function getIndustriesPage(
  page: number,
  options: IndustryQueryOptions = {}
): Promise<{ items: IndustryListItem[]; hasMore: boolean; total: number }> {
  const all = await getIndustriesEnhanced(options);
  const start = (page - 1) * INDUSTRIES_PAGE_SIZE;
  const items = all.slice(start, start + INDUSTRIES_PAGE_SIZE);
  return { items, hasMore: start + INDUSTRIES_PAGE_SIZE < all.length, total: all.length };
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
      jsonLdStructuredData: true,
      clients: {
        where: { subscriptionStatus: SubscriptionStatus.ACTIVE },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          logoMedia: { select: { url: true } },
          heroImageMedia: { select: { url: true } },
          phone: true,
          addressCity: true,
          description: true,
          slogan: true,
          _count: { select: { articles: true } },
        },
      },
    },
  });
}
