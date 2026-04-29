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

export interface LeadStats {
  total: number;
  qualified: number;
  hot: number;
  warm: number;
  cold: number;
  avgScore: number;
}

const PAGE_LIMIT = 200;

export async function getLeads(clientId: string): Promise<LeadWithDetails[]> {
  const leads = await db.leadScoring.findMany({
    where: { clientId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { engagementScore: "desc" },
    take: PAGE_LIMIT,
  });
  return leads as LeadWithDetails[];
}

export async function getLeadStats(clientId: string): Promise<LeadStats> {
  const [total, qualified, hot, warm, cold, avgScoreAgg] = await Promise.all([
    db.leadScoring.count({ where: { clientId } }),
    db.leadScoring.count({ where: { clientId, isQualified: true } }),
    db.leadScoring.count({ where: { clientId, qualificationLevel: "HOT" } }),
    db.leadScoring.count({ where: { clientId, qualificationLevel: "WARM" } }),
    db.leadScoring.count({ where: { clientId, qualificationLevel: "COLD" } }),
    db.leadScoring.aggregate({
      where: { clientId },
      _avg: { engagementScore: true },
    }),
  ]);

  return {
    total,
    qualified,
    hot,
    warm,
    cold,
    avgScore: Math.round(avgScoreAgg._avg.engagementScore || 0),
  };
}

/** Returns the most recent `updatedAt` across this client's leads — used as
 *  a "last refreshed" indicator on the page header. */
export async function getLeadsLastRefreshedAt(
  clientId: string
): Promise<Date | null> {
  const top = await db.leadScoring.findFirst({
    where: { clientId },
    orderBy: { updatedAt: "desc" },
    select: { updatedAt: true },
  });
  return top?.updatedAt ?? null;
}

/** Sidebar badge — count of qualified leads (≥ 60). Layout calls this. */
export async function getLeadsCount(clientId: string): Promise<number> {
  return db.leadScoring.count({
    where: { clientId, isQualified: true },
  });
}
