"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { MediaFilters } from "./types";

export async function getMedia(filters?: MediaFilters) {
  try {
    const whereConditions: Prisma.MediaWhereInput[] = [];

    // Always filter out media with null clientId (existing records before migration)
    // This prevents showing orphaned media without clientId
    whereConditions.push({ clientId: { not: null } });

    // Client filter (required for non-admin, optional "all" for admin)
    if (filters?.clientId && filters.clientId !== "all") {
      whereConditions.push({ clientId: filters.clientId });
    }

    // MIME type filter
    if (filters?.mimeType) {
      if (filters.mimeType === "image") {
        whereConditions.push({ mimeType: { startsWith: "image/" } });
      } else if (filters.mimeType === "video") {
        whereConditions.push({ mimeType: { startsWith: "video/" } });
      } else {
        whereConditions.push({ mimeType: filters.mimeType });
      }
    }

    // Media type filter
    if (filters?.type) {
      whereConditions.push({ type: filters.type });
    }

    // Search filter (filename, altText)
    if (filters?.search) {
      whereConditions.push({
        OR: [
          { filename: { contains: filters.search, mode: "insensitive" } },
          { altText: { contains: filters.search, mode: "insensitive" } },
        ],
      });
    }

    // Date range filter
    if (filters?.dateFrom || filters?.dateTo) {
      const dateCondition: Prisma.DateTimeFilter = {};
      if (filters.dateFrom) {
        dateCondition.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        dateCondition.lte = filters.dateTo;
      }
      whereConditions.push({ createdAt: dateCondition });
    }

    // Usage filter (used/unused)
    if (filters?.used !== undefined) {
      if (filters.used) {
        // Media is used if it is featured in articles
        whereConditions.push({
          featuredArticles: { some: {} },
        });
      } else {
        // Media is unused if it is not featured in any articles
        whereConditions.push({
          featuredArticles: { none: {} },
        });
      }
    }

    // Combine all conditions with AND
    const where: Prisma.MediaWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const media = await db.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return media;
  } catch (error) {
    console.error("Error fetching media:", error);
    return [];
  }
}
