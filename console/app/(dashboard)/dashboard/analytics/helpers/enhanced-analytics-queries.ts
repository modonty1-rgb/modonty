import { db } from "@/lib/db";
import { TrafficSource, ConversionType, CTAType } from "@prisma/client";

export interface TrafficSourceData {
  source: string;
  count: number;
  percentage: number;
}

export interface CoreWebVitals {
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  ttfb: number | null;
  tbt: number | null;
  fid: number | null;
}

export interface EngagementMetrics {
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

export interface ConversionData {
  type: string;
  count: number;
  percentage: number;
  value: number | null;
}

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  type: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number | null;
}

export interface ArticlePerformance {
  articleId: string;
  title: string;
  slug: string;
  views: number;
  avgTimeOnPage: number;
  avgScrollDepth: number;
  conversions: number;
  category: string | null;
}

export async function getTrafficSources(
  clientId: string,
  days: 7 | 30 | 90 = 30
): Promise<TrafficSourceData[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const sources = await db.analytics.groupBy({
    by: ["source"],
    where: {
      article: { clientId },
      timestamp: { gte: since },
    },
    _count: {
      source: true,
    },
  });

  const total = sources.reduce((sum, s) => sum + s._count.source, 0);

  return sources.map((s) => ({
    source: s.source,
    count: s._count.source,
    percentage: total > 0 ? (s._count.source / total) * 100 : 0,
  }));
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

  const scrollDepths = await db.engagementDuration.findMany({
    where: {
      article: { clientId },
      createdAt: { gte: since },
    },
    select: { scrollDepth: true },
  });

  const distribution = {
    "0-25": 0,
    "25-50": 0,
    "50-75": 0,
    "75-100": 0,
  };

  scrollDepths.forEach((ed) => {
    const depth = ed.scrollDepth;
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
    avgReadingTime: engagementDuration._avg.readingTime ?? 0,
    scrollDepthDistribution: distribution,
    engagedSessions,
    bouncedSessions,
  };
}

export async function getConversions(
  clientId: string,
  days: 7 | 30 | 90 = 30
): Promise<{ conversions: ConversionData[]; total: number; rate: number }> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const conversions = await db.conversion.groupBy({
    by: ["type"],
    where: {
      article: { clientId },
      createdAt: { gte: since },
    },
    _count: {
      type: true,
    },
    _sum: {
      value: true,
    },
  });

  const totalViews = await db.articleView.count({
    where: {
      article: { clientId },
      createdAt: { gte: since },
    },
  });

  const totalConversions = conversions.reduce((sum, c) => sum + c._count.type, 0);
  const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

  const conversionData: ConversionData[] = conversions.map((c) => ({
    type: c.type,
    count: c._count.type,
    percentage: totalConversions > 0 ? (c._count.type / totalConversions) * 100 : 0,
    value: c._sum.value,
  }));

  return {
    conversions: conversionData,
    total: totalConversions,
    rate: conversionRate,
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

export async function getArticlePerformance(
  clientId: string,
  days: 7 | 30 | 90 = 30,
  limit: number = 10
): Promise<ArticlePerformance[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const articles = await db.article.findMany({
    where: {
      clientId,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      category: { select: { name: true } },
    },
    take: 50,
  });

  const articlesWithMetrics = await Promise.all(
    articles.map(async (article) => {
      const [views, analytics, conversions] = await Promise.all([
        db.articleView.count({
          where: {
            articleId: article.id,
            createdAt: { gte: since },
          },
        }),
        db.analytics.aggregate({
          where: {
            articleId: article.id,
            timestamp: { gte: since },
          },
          _avg: {
            timeOnPage: true,
            scrollDepth: true,
          },
        }),
        db.conversion.count({
          where: {
            articleId: article.id,
            createdAt: { gte: since },
          },
        }),
      ]);

      return {
        articleId: article.id,
        title: article.title,
        slug: article.slug,
        views,
        avgTimeOnPage: analytics._avg.timeOnPage ?? 0,
        avgScrollDepth: analytics._avg.scrollDepth ?? 0,
        conversions,
        category: article.category?.name ?? null,
      };
    })
  );

  return articlesWithMetrics
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}
