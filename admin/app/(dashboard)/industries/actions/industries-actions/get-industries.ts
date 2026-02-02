"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { IndustryFilters } from "./types";

export async function getIndustries(filters?: IndustryFilters) {
  try {
    const where: Prisma.IndustryWhereInput = {};

    if (filters?.createdFrom || filters?.createdTo) {
      where.createdAt = {};
      if (filters.createdFrom) {
        where.createdAt.gte = filters.createdFrom;
      }
      if (filters.createdTo) {
        where.createdAt.lte = filters.createdTo;
      }
    }

    if (filters?.hasClients !== undefined) {
      if (filters.hasClients) {
        where.clients = {
          some: {},
        };
      } else {
        where.clients = {
          none: {},
        };
      }
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { slug: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const industries = await db.industry.findMany({
      where,
      include: {
        _count: { select: { clients: true } },
      },
      orderBy: { name: "asc" },
    });

    let filteredIndustries = industries;

    if (filters?.minClientCount !== undefined || filters?.maxClientCount !== undefined) {
      filteredIndustries = industries.filter((industry) => {
        const clientCount = industry._count.clients;
        if (filters.minClientCount !== undefined && clientCount < filters.minClientCount) {
          return false;
        }
        if (filters.maxClientCount !== undefined && clientCount > filters.maxClientCount) {
          return false;
        }
        return true;
      });
    }

    return filteredIndustries;
  } catch (error) {
    console.error("Error fetching industries:", error);
    return [];
  }
}
