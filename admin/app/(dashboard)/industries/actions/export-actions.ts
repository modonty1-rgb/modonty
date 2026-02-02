"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { IndustryFilters } from "./industries-actions";

function escapeCsvValue(value: string | null | undefined): string {
  if (!value) return "";
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function exportIndustriesToCSV(filters?: IndustryFilters): Promise<string> {
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
        _count: {
          select: {
            clients: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
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

    const headers = [
      "Name",
      "Slug",
      "Client Count",
      "Created Date",
    ];

    const csvRows = [headers.join(",")];

    for (const industry of filteredIndustries) {
      const row = [
        escapeCsvValue(industry.name),
        escapeCsvValue(industry.slug),
        industry._count.clients.toString(),
        formatDate(industry.createdAt),
      ];
      csvRows.push(row.join(","));
    }

    return csvRows.join("\n");
  } catch (error) {
    console.error("Error exporting industries to CSV:", error);
    throw new Error("Failed to export industries to CSV");
  }
}
