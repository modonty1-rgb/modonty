"use server";

import { Prisma } from "@prisma/client";
import { MEDIA_USED_WHERE, MEDIA_UNUSED_WHERE } from "@/lib/media/usage-where";
import { listMedia, DEFAULT_MEDIA_PER_PAGE } from "@/lib/media/list-media";
import type { MediaFilters } from "./types";

export async function getMedia(filters?: MediaFilters) {
  try {
    const whereConditions: Prisma.MediaWhereInput[] = [];

    if (filters?.scope) {
      whereConditions.push({ scope: filters.scope });
    } else if (filters?.clientId && filters.clientId !== "all") {
      const orClauses: import("@prisma/client").Prisma.MediaWhereInput[] = [
        { clientId: filters.clientId },
      ];
      if (filters.includeGeneral) {
        orClauses.push({ scope: "GENERAL", clientId: null });
      }
      if (filters.includePlatform) {
        orClauses.push({ scope: "PLATFORM", clientId: null });
      }
      whereConditions.push(orClauses.length === 1 ? orClauses[0] : { OR: orClauses });
    } else {
      // Default list: show CLIENT + GENERAL, exclude PLATFORM unless explicitly requested
      if (!filters?.includePlatform) {
        whereConditions.push({ scope: { not: "PLATFORM" } });
      }
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
      whereConditions.push(filters.used ? MEDIA_USED_WHERE : MEDIA_UNUSED_WHERE);
    }

    // Client-gallery images are managed in their own /client-galleries route — never
    // surface them in the general Media library.
    whereConditions.push({ type: { not: "GALLERY" } });

    const where: Prisma.MediaWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    return await listMedia(where, { sort: filters?.sort, page: filters?.page, perPage: filters?.perPage });
  } catch (error) {
    console.error("Error fetching media:", error);
    return { items: [], total: 0, page: 1, perPage: DEFAULT_MEDIA_PER_PAGE, totalPages: 0 };
  }
}
