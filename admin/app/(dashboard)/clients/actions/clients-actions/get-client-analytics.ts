"use server";

export async function getClientAnalytics(clientId: string) {
  try {
    const { getAnalyticsData } = await import("@/app/(dashboard)/analytics/actions/analytics-actions");
    return await getAnalyticsData({ clientId });
  } catch (error) {
    console.error("Error fetching client analytics:", error);
    return {
      totalViews: 0,
      uniqueSessions: 0,
      avgTimeOnPage: 0,
      bounceRate: 0,
      avgScrollDepth: 0,
      topArticles: [],
      trafficSources: {},
    };
  }
}

