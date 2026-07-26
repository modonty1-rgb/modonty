"use server";

import { db } from "@/lib/db";
import { computeReferenceSeoScore } from "@modonty/database/lib/seo/reference/seo-score";
import type { JsonLdValidationReport } from "@modonty/database/lib/seo/client/types";

export async function getIndustriesStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, withClients, withoutClients, createdThisMonth, allIndustries] = await Promise.all([
      db.industry.count(),
      db.industry.count({
        where: {
          clients: {
            some: {},
          },
        },
      }),
      db.industry.count({
        where: {
          clients: {
            none: {},
          },
        },
      }),
      db.industry.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),
      // Score from the shared reference scorer (reads the STORED metadata + JSON-LD).
      db.industry.findMany({
        select: {
          name: true,
          nextjsMetadata: true,
          jsonLdStructuredData: true,
          jsonLdValidationReport: true,
        },
        take: 500,
      }),
    ]);

    let averageSEO = 0;
    if (allIndustries.length > 0) {
      const scores = allIndustries.map((industry) =>
        computeReferenceSeoScore({
          name: industry.name,
          nextjsMetadata: industry.nextjsMetadata,
          jsonLdStructuredData: industry.jsonLdStructuredData,
          jsonLdValidationReport: (industry.jsonLdValidationReport ?? null) as JsonLdValidationReport | null,
        }).score,
      );
      averageSEO = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }

    return {
      total,
      withClients,
      withoutClients,
      createdThisMonth,
      averageSEO,
    };
  } catch (error) {
    console.error("Error fetching industries stats:", error);
    return {
      total: 0,
      withClients: 0,
      withoutClients: 0,
      createdThisMonth: 0,
      averageSEO: 0,
    };
  }
}
