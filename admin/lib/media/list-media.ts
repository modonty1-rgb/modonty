import "server-only";

import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const DEFAULT_MEDIA_PER_PAGE = 20;

function buildSortOrder(sort?: string): Prisma.MediaOrderByWithRelationInput {
  switch (sort) {
    case "oldest": return { createdAt: "asc" };
    case "name-asc": return { filename: "asc" };
    case "name-desc": return { filename: "desc" };
    case "size-asc": return { fileSize: "asc" };
    case "size-desc": return { fileSize: "desc" };
    default: return { createdAt: "desc" };
  }
}

/**
 * One page of media rows for a ready-made `where` — the fetch half of the media screens.
 *
 * Split out of `getMedia` (26 Sep 2026) when Clients › Media arrived: that page is the same
 * grid with a different universe of rows, so the two pages build their own `where` and
 * share everything after it — the include the grid renders, the sort keys, the paging.
 * Not a server action on purpose: it takes a raw Prisma `where`, which a client must never
 * be able to send.
 */
export async function listMedia(
  where: Prisma.MediaWhereInput,
  options: { sort?: string; page?: number; perPage?: number } = {},
) {
  const page = Math.max(1, options.page ?? 1);
  const perPage = options.perPage ?? DEFAULT_MEDIA_PER_PAGE;
  const skip = (page - 1) * perPage;

  const [items, total] = await Promise.all([
    db.media.findMany({
      where,
      orderBy: buildSortOrder(options.sort),
      skip,
      take: perPage,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
          },
        },
        _count: {
          select: {
            featuredArticles: true,
            logoClients: true,
            heroImageClients: true,
            mobileHeroImageClients: true,
          },
        },
      },
    }),
    db.media.count({ where }),
  ]);

  return { items, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}
