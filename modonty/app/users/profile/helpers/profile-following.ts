import { db } from "@/lib/db";

export interface FollowedClient {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  articleCount: number;
  followedAt: Date;
  industry: { id: string; name: string; slug: string } | null;
}

/**
 * Server-side counterpart of GET /api/users/[id]/following. Returns clients
 * the user follows (i.e. `clientLike`). Per-request (not cached) — profile
 * is `noindex` and follow state changes interactively.
 */
export async function getProfileFollowing(
  userId: string,
  limit = 20,
): Promise<FollowedClient[]> {
  const safeLimit = Math.max(1, Math.min(limit, 50));

  const follows = await db.clientLike.findMany({
    where: { userId },
    select: {
      createdAt: true,
      client: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logoMedia: { select: { url: true } },
          industry: { select: { id: true, name: true, slug: true } },
          _count: { select: { articles: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: safeLimit,
  });

  return follows.map((follow) => ({
    id: follow.client.id,
    name: follow.client.name,
    slug: follow.client.slug,
    description: follow.client.description,
    logo: follow.client.logoMedia?.url ?? null,
    articleCount: follow.client._count.articles,
    followedAt: follow.createdAt,
    industry: follow.client.industry,
  }));
}
