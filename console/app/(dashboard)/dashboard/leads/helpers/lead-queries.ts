import { db } from "@/lib/db";

export interface LeadWithDetails {
  id: string;
  email: string | null;
  phone: string | null;
  engagementScore: number;
  viewScore: number;
  timeScore: number;
  interactionScore: number;
  conversionScore: number;
  pagesViewed: number;
  totalTimeSpent: number;
  interactions: number;
  conversions: number;
  isQualified: boolean;
  qualificationLevel: string | null;
  lastActivityAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export async function getLeads(
  clientId: string,
  qualificationLevel?: string
): Promise<LeadWithDetails[]> {
  const leads = await db.leadScoring.findMany({
    where: {
      clientId,
      ...(qualificationLevel && { qualificationLevel }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      engagementScore: "desc",
    },
    take: 100,
  });

  return leads as LeadWithDetails[];
}

export async function getLeadStats(clientId: string) {
  const [total, qualified, hot, warm, cold, avgScore] = await Promise.all([
    db.leadScoring.count({
      where: { clientId },
    }),
    db.leadScoring.count({
      where: { clientId, isQualified: true },
    }),
    db.leadScoring.count({
      where: { clientId, qualificationLevel: "HOT" },
    }),
    db.leadScoring.count({
      where: { clientId, qualificationLevel: "WARM" },
    }),
    db.leadScoring.count({
      where: { clientId, qualificationLevel: "COLD" },
    }),
    db.leadScoring.aggregate({
      where: { clientId },
      _avg: {
        engagementScore: true,
      },
    }),
  ]);

  return {
    total,
    qualified,
    hot,
    warm,
    cold,
    avgScore: Math.round(avgScore._avg.engagementScore || 0),
  };
}

export async function getTopLeads(clientId: string, limit: number = 10) {
  return db.leadScoring.findMany({
    where: {
      clientId,
      isQualified: true,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      engagementScore: "desc",
    },
    take: limit,
  });
}
