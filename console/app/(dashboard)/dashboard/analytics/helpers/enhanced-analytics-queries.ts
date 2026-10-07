import { db } from "@/lib/db";

interface CoreWebVitals {
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  ttfb: number | null;
  tbt: number | null;
  fid: number | null;
}

interface EngagementMetrics {
  avgTimeOnPage: number;
  avgScrollDepth: number;
  avgCompletionRate: number;
  bounceRate: number;
  engagementRate: number;
  avgReadingTime: number;
  scrollDepthDistribution: {
    "0-25": number;
    "25-50": number;
    "50-75": number;
    "75-100": number;
  };
  engagedSessions: number;
  bouncedSessions: number;
}

interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  type: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number | null;
}

export async function getCoreWebVitals(
  clientId: string,
  days: 7 | 30 | 90 = 30
): Promise<CoreWebVitals> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const vitals = await db.analytics.aggregate({
    where: {
      article: { clientId },
      timestamp: { gte: since },
    },
    _avg: {
      lcp: true,
      cls: true,
      inp: true,
      ttfb: true,
      tbt: true,
      fid: true,
    },
  });

  return {
    lcp: vitals._avg.lcp,
    cls: vitals._avg.cls,
    inp: vitals._avg.inp,
    ttfb: vitals._avg.ttfb,
    tbt: vitals._avg.tbt,
    fid: vitals._avg.fid,
  };
}

export async function getEngagementMetrics(
  clientId: string,
  days: 7 | 30 | 90 = 30
): Promise<EngagementMetrics> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [analytics, engagementDuration, totalViews] = await Promise.all([
    db.analytics.aggregate({
      where: {
        article: { clientId },
        timestamp: { gte: since },
      },
      _avg: {
        timeOnPage: true,
        scrollDepth: true,
      },
      _count: {
        id: true,
      },
    }),
    db.engagementDuration.aggregate({
      where: {
        article: { clientId },
        createdAt: { gte: since },
      },
      _avg: {
        timeOnPage: true,
        scrollDepth: true,
        completionRate: true,
        readingTime: true,
      },
      _count: {
        id: true,
      },
    }),
    db.analytics.count({
      where: {
        article: { clientId },
        timestamp: { gte: since },
      },
    }),
  ]);

  const bouncedCount = await db.analytics.count({
    where: {
      article: { clientId },
      timestamp: { gte: since },
      bounced: true,
    },
  });

  const engagedSessions = await db.engagementDuration.count({
    where: {
      article: { clientId },
      createdAt: { gte: since },
      engagedSession: true,
    },
  });

  const bouncedSessions = await db.engagementDuration.count({
    where: {
      article: { clientId },
      createdAt: { gte: since },
      bounced: true,
    },
  });

  // Use analytics table (real data) — engagementDuration is deferred/empty
  const scrollDepths = await db.analytics.findMany({
    where: {
      article: { clientId },
      timestamp: { gte: since },
      scrollDepth: { not: null },
    },
    select: { scrollDepth: true },
  });

  const distribution = {
    "0-25": 0,
    "25-50": 0,
    "50-75": 0,
    "75-100": 0,
  };

  scrollDepths.forEach((row) => {
    const depth = row.scrollDepth ?? 0;
    if (depth <= 25) distribution["0-25"]++;
    else if (depth <= 50) distribution["25-50"]++;
    else if (depth <= 75) distribution["50-75"]++;
    else distribution["75-100"]++;
  });

  const total = scrollDepths.length;
  if (total > 0) {
    distribution["0-25"] = (distribution["0-25"] / total) * 100;
    distribution["25-50"] = (distribution["25-50"] / total) * 100;
    distribution["50-75"] = (distribution["50-75"] / total) * 100;
    distribution["75-100"] = (distribution["75-100"] / total) * 100;
  }

  const bounceRate = totalViews > 0 ? (bouncedCount / totalViews) * 100 : 0;
  const engagementRate = totalViews > 0 ? (engagedSessions / totalViews) * 100 : 0;

  return {
    avgTimeOnPage: analytics._avg.timeOnPage ?? engagementDuration._avg.timeOnPage ?? 0,
    avgScrollDepth: analytics._avg.scrollDepth ?? engagementDuration._avg.scrollDepth ?? 0,
    avgCompletionRate: engagementDuration._avg.completionRate ?? 0,
    bounceRate,
    engagementRate,
    // engagementDuration.readingTime is deferred — use analytics.timeOnPage as proxy
    avgReadingTime: engagementDuration._avg.readingTime ?? analytics._avg.timeOnPage ?? 0,
    scrollDepthDistribution: distribution,
    engagedSessions,
    bouncedSessions,
  };
}

export async function getCampaignPerformance(
  clientId: string,
  days: 7 | 30 | 90 = 30
): Promise<CampaignPerformance[]> {
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

  return campaigns.map((c) => ({
    campaignId: c.campaignId,
    campaignName: c.campaignName,
    type: c.type,
    impressions: c._sum.impressions ?? 0,
    clicks: c._sum.clicks ?? 0,
    conversions: c._sum.conversions ?? 0,
    cost: c._sum.cost,
  }));
}
