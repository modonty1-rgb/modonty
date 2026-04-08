"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { MediaFilters } from "./types";

const DEFAULT_PER_PAGE = 20;

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

export async function getMedia(filters?: MediaFilters) {
  try {
    const whereConditions: Prisma.MediaWhereInput[] = [];

    whereConditions.push({ clientId: { not: null } });

    if (filters?.clientId && filters.clientId !== "all") {
      whereConditions.push({ clientId: filters.clientId });
    }

    if (filters?.mimeType) {
      if (filters.mimeType === "image") {
        whereConditions.push({ mimeType: { startsWith: "image/" } });
      } else if (filters.mimeType === "video") {
        whereConditions.push({ mimeType: { startsWith: "video/" } });
      } else {
        whereConditions.push({ mimeType: filters.mimeType });
      }
    }

    if (filters?.type) {
      whereConditions.push({ type: filters.type });
    }

    if (filters?.search) {
      whereConditions.push({
        OR: [
          { filename: { contains: filters.search, mode: "insensitive" } },
          { altText: { contains: filters.search, mode: "insensitive" } },
          { title: { contains: filters.search, mode: "insensitive" } },
        ],
      });
    }

    if (filters?.dateFrom || filters?.dateTo) {
      const dateCondition: Prisma.DateTimeFilter = {};
      if (filters.dateFrom) dateCondition.gte = filters.dateFrom;
      if (filters.dateTo) dateCondition.lte = filters.dateTo;
      whereConditions.push({ createdAt: dateCondition });
    }

    if (filters?.used !== undefined) {
      if (filters.used) {
        whereConditions.push({ featuredArticles: { some: {} } });
      } else {
        whereConditions.push({ featuredArticles: { none: {} } });
      }
    }

    const where: Prisma.MediaWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const page = Math.max(1, filters?.page ?? 1);
    const perPage = filters?.perPage ?? DEFAULT_PER_PAGE;
    const skip = (page - 1) * perPage;

    const [items, total] = await Promise.all([
      db.media.findMany({
        where,
        orderBy: buildSortOrder(filters?.sort),
        skip,
        take: perPage,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoMedia: { select: { url: true } },
            },
          },
          _count: {
            select: {
              featuredArticles: true,
              logoClients: true,
              heroImageClients: true,
            },
          },
        },
      }),
      db.media.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  } catch (error) {
    console.error("Error fetching media:", error);
    return { items: [], total: 0, page: 1, perPage: DEFAULT_PER_PAGE, totalPages: 0 };
  }
}
