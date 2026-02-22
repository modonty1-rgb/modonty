import { db } from "@/lib/db";

export async function getClientSeoData(clientId: string) {
  const [client, competitors, keywords, latestIntake] = await Promise.all([
    db.client.findUnique({
      where: { id: clientId },
      select: {
        slug: true,
        url: true,
        sameAs: true,
        technicalProfile: true,
        seoGoals: true,
        seoMetrics: true,
        linkBuildingPolicy: true,
        brandGuidelines: true,
        contentTone: true,
        complianceConstraints: true,
        googleBusinessProfileUrl: true,
        forbiddenKeywords: true,
        forbiddenClaims: true,
        competitiveMentionsAllowed: true,
      },
    }),
    db.clientCompetitor.findMany({
      where: { clientId },
      orderBy: { order: "asc" },
    }),
    db.clientKeyword.findMany({
      where: { clientId },
      orderBy: [{ priority: "desc" }, { keyword: "asc" }],
    }),
    db.seoIntake.findFirst({
      where: { clientId },
      orderBy: { collectedAt: "desc" },
    }),
  ]);

  return {
    client,
    competitors,
    keywords,
    latestIntake,
  };
}
