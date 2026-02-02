"use server";

import { db } from "@/lib/db";
import { calculateSEOScore } from "@/helpers/utils/seo-score-calculator";
import { industrySEOConfig } from "../../helpers/industry-seo-config";

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
      db.industry.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          seoTitle: true,
          seoDescription: true,
          canonicalUrl: true,
        },
      }),
    ]);

    let averageSEO = 0;
    if (allIndustries.length > 0) {
      const scores = allIndustries.map((industry) => {
        const scoreResult = calculateSEOScore(industry, industrySEOConfig);
        return scoreResult.percentage;
      });
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
