import { db } from "@/lib/db";
import { CampaignType } from "@prisma/client";

export interface CampaignSummary {
  campaignId: string;
  campaignName: string;
  type: CampaignType;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  conversionRate: number;
  costPerClick: number;
  costPerConversion: number;
  roi: number;
}

export async function getCampaignsList(
  clientId: string,
  days: 7 | 30 | 90 = 30
): Promise<CampaignSummary[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const campaigns = await db.campaignTracking.groupBy({
    by: ["campaignId", "campaignName", "type"],
    where: {
      clientId,
      createdAt: { gte: since },
    },
    _sum: {
      impressions: true,
      clicks: true,
      conversions: true,
      cost: true,
    },
  });

  return campaigns.map((c) => {
    const impressions = c._sum.impressions || 0;
    const clicks = c._sum.clicks || 0;
    const conversions = c._sum.conversions || 0;
    const cost = c._sum.cost || 0;

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const costPerClick = clicks > 0 ? cost / clicks : 0;
    const costPerConversion = conversions > 0 ? cost / conversions : 0;
    const roi = cost > 0 ? ((conversions * 100 - cost) / cost) * 100 : 0;

    return {
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      type: c.type,
      impressions,
      clicks,
      conversions,
      cost,
      ctr,
      conversionRate,
      costPerClick,
      costPerConversion,
      roi,
    };
  });
}

export interface UTMPerformance {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  visits: number;
  conversions: number;
  conversionRate: number;
}

export async function getUTMPerformance(
  clientId: string,
  days: 7 | 30 | 90 = 30
): Promise<UTMPerformance[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const utmData = await db.campaignTracking.groupBy({
    by: ["utmSource", "utmMedium", "utmCampaign"],
    where: {
      clientId,
      createdAt: { gte: since },
      utmCampaign: { not: null },
    },
    _count: {
      id: true,
    },
    _sum: {
      conversions: true,
    },
  });

  return utmData
    .filter((u) => u.utmCampaign)
    .map((u) => {
      const visits = u._count.id;
      const conversions = u._sum.conversions || 0;
      const conversionRate = visits > 0 ? (conversions / visits) * 100 : 0;

      return {
        utmSource: u.utmSource || "unknown",
        utmMedium: u.utmMedium || "unknown",
        utmCampaign: u.utmCampaign || "unknown",
        visits,
        conversions,
        conversionRate,
      };
    });
}

export async function getCampaignStats(clientId: string, days: 7 | 30 | 90 = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [totalCampaigns, totalTracking, topCampaigns] = await Promise.all([
    db.campaignTracking.findMany({
      where: {
        clientId,
        createdAt: { gte: since },
      },
      distinct: ["campaignId"],
      select: { campaignId: true },
    }),
    db.campaignTracking.aggregate({
      where: {
        clientId,
        createdAt: { gte: since },
      },
      _sum: {
        impressions: true,
        clicks: true,
        conversions: true,
        cost: true,
      },
    }),
    db.campaignTracking.groupBy({
      by: ["campaignName"],
      where: {
        clientId,
        createdAt: { gte: since },
      },
      _sum: {
        conversions: true,
      },
      orderBy: {
        _sum: {
          conversions: "desc",
        },
      },
      take: 5,
    }),
  ]);

  return {
    totalCampaigns: totalCampaigns.length,
    totalImpressions: totalTracking._sum.impressions || 0,
    totalClicks: totalTracking._sum.clicks || 0,
    totalConversions: totalTracking._sum.conversions || 0,
    totalCost: totalTracking._sum.cost || 0,
    topCampaigns: topCampaigns.map((c) => ({
      name: c.campaignName,
      conversions: c._sum.conversions || 0,
    })),
  };
}
