import { db } from "@/lib/db";

const DAYS_WINDOW = 30;
const HOT_THRESHOLD = 70;
const WARM_THRESHOLD = 40;
const QUALIFIED_THRESHOLD = 60;

export interface LeadScorePayload {
  userId: string | null;
  sessionId: string | null;
  clientId: string;
  pagesViewed: number;
  totalTimeSpent: number;
  interactions: number;
  conversions: number;
  lastActivityAt: Date | null;
  viewScore: number;
  timeScore: number;
  interactionScore: number;
  conversionScore: number;
  engagementScore: number;
  qualificationLevel: string;
  isQualified: boolean;
}

function since() {
  const d = new Date();
  d.setDate(d.getDate() - DAYS_WINDOW);
  return d;
}

export async function computeLeadScoresForClient(
  clientId: string
): Promise<LeadScorePayload[]> {
  const sinceDate = since();

  const [articleViews, clientViews, analytics, ctaClicks, conversions] =
    await Promise.all([
      db.articleView.findMany({
        where: {
          article: { clientId },
          createdAt: { gte: sinceDate },
        },
        select: {
          userId: true,
          sessionId: true,
          createdAt: true,
        },
      }),
      db.clientView.findMany({
        where: {
          clientId,
          createdAt: { gte: sinceDate },
        },
        select: {
          userId: true,
          sessionId: true,
          createdAt: true,
        },
      }),
      db.analytics.findMany({
        where: {
          clientId,
          timestamp: { gte: sinceDate },
        },
        select: {
          userId: true,
          sessionId: true,
          timeOnPage: true,
          timestamp: true,
        },
      }),
      db.cTAClick.findMany({
        where: {
          clientId,
          createdAt: { gte: sinceDate },
        },
        select: {
          userId: true,
          sessionId: true,
          createdAt: true,
        },
      }),
      db.conversion.findMany({
        where: {
          clientId,
          createdAt: { gte: sinceDate },
        },
        select: {
          userId: true,
          sessionId: true,
          createdAt: true,
        },
      }),
    ]);

  type Key = string;
  const agg: Record<
    Key,
    {
      userId: string | null;
      sessionId: string | null;
      pagesViewed: number;
      totalTimeSpent: number;
      interactions: number;
      conversions: number;
      lastActivityAt: Date | null;
    }
  > = {};

  function key(uid: string | null, sid: string | null) {
    return uid ? `u_${uid}` : `s_${sid ?? ""}`;
  }

  function add(
    uid: string | null,
    sid: string | null,
    update: {
      pagesViewed?: number;
      totalTimeSpent?: number;
      interactions?: number;
      conversions?: number;
      lastActivityAt?: Date;
    }
  ) {
    if (!uid && !sid) return;
    const k = key(uid, sid);
    if (!agg[k]) {
      agg[k] = {
        userId: uid,
        sessionId: uid ? null : sid,
        pagesViewed: 0,
        totalTimeSpent: 0,
        interactions: 0,
        conversions: 0,
        lastActivityAt: null,
      };
    }
    const a = agg[k];
    if (update.pagesViewed) a.pagesViewed += update.pagesViewed;
    if (update.totalTimeSpent) a.totalTimeSpent += update.totalTimeSpent;
    if (update.interactions) a.interactions += update.interactions;
    if (update.conversions) a.conversions += update.conversions;
    if (update.lastActivityAt) {
      if (
        !a.lastActivityAt ||
        update.lastActivityAt.getTime() > a.lastActivityAt.getTime()
      ) {
        a.lastActivityAt = update.lastActivityAt;
      }
    }
  }

  articleViews.forEach((v) => {
    add(v.userId, v.sessionId, {
      pagesViewed: 1,
      lastActivityAt: v.createdAt,
    });
  });
  clientViews.forEach((v) => {
    add(v.userId, v.sessionId, {
      pagesViewed: 1,
      lastActivityAt: v.createdAt,
    });
  });
  analytics.forEach((a) => {
    add(a.userId, a.sessionId, {
      totalTimeSpent: a.timeOnPage ?? 0,
      lastActivityAt: a.timestamp,
    });
  });
  ctaClicks.forEach((c) => {
    add(c.userId, c.sessionId, {
      interactions: 1,
      lastActivityAt: c.createdAt,
    });
  });
  conversions.forEach((c) => {
    add(c.userId, c.sessionId, {
      conversions: 1,
      lastActivityAt: c.createdAt,
    });
  });

  const payloads: LeadScorePayload[] = [];

  for (const a of Object.values(agg)) {
    const viewScore = Math.min(100, a.pagesViewed * 10);
    const timeScore = Math.min(100, (a.totalTimeSpent / 60) * 10);
    const interactionScore = Math.min(100, a.interactions * 20);
    const conversionScore = a.conversions > 0 ? 100 : 0;
    const engagementScore = Math.min(
      100,
      Math.round(
        viewScore * 0.25 +
          timeScore * 0.25 +
          interactionScore * 0.25 +
          conversionScore * 0.25
      )
    );
    const qualificationLevel =
      engagementScore >= HOT_THRESHOLD
        ? "HOT"
        : engagementScore >= WARM_THRESHOLD
          ? "WARM"
          : "COLD";
    const isQualified = engagementScore >= QUALIFIED_THRESHOLD;

    payloads.push({
      userId: a.userId,
      sessionId: a.sessionId,
      clientId,
      pagesViewed: a.pagesViewed,
      totalTimeSpent: a.totalTimeSpent,
      interactions: a.interactions,
      conversions: a.conversions,
      lastActivityAt: a.lastActivityAt,
      viewScore,
      timeScore,
      interactionScore,
      conversionScore,
      engagementScore,
      qualificationLevel,
      isQualified,
    });
  }

  return payloads;
}

export async function upsertLeadScoring(
  payloads: LeadScorePayload[]
): Promise<number> {
  let count = 0;
  for (const p of payloads) {
    if (p.userId) {
      await db.leadScoring.upsert({
        where: {
          userId_clientId: { userId: p.userId, clientId: p.clientId },
        },
        create: {
          userId: p.userId,
          clientId: p.clientId,
          sessionId: null,
          pagesViewed: p.pagesViewed,
          totalTimeSpent: p.totalTimeSpent,
          interactions: p.interactions,
          conversions: p.conversions,
          lastActivityAt: p.lastActivityAt,
          viewScore: p.viewScore,
          timeScore: p.timeScore,
          interactionScore: p.interactionScore,
          conversionScore: p.conversionScore,
          engagementScore: p.engagementScore,
          qualificationLevel: p.qualificationLevel,
          isQualified: p.isQualified,
        },
        update: {
          pagesViewed: p.pagesViewed,
          totalTimeSpent: p.totalTimeSpent,
          interactions: p.interactions,
          conversions: p.conversions,
          lastActivityAt: p.lastActivityAt,
          viewScore: p.viewScore,
          timeScore: p.timeScore,
          interactionScore: p.interactionScore,
          conversionScore: p.conversionScore,
          engagementScore: p.engagementScore,
          qualificationLevel: p.qualificationLevel,
          isQualified: p.isQualified,
        },
      });
      count++;
    } else if (p.sessionId) {
      await db.leadScoring.upsert({
        where: {
          sessionId_clientId: { sessionId: p.sessionId, clientId: p.clientId },
        },
        create: {
          sessionId: p.sessionId,
          clientId: p.clientId,
          userId: null,
          pagesViewed: p.pagesViewed,
          totalTimeSpent: p.totalTimeSpent,
          interactions: p.interactions,
          conversions: p.conversions,
          lastActivityAt: p.lastActivityAt,
          viewScore: p.viewScore,
          timeScore: p.timeScore,
          interactionScore: p.interactionScore,
          conversionScore: p.conversionScore,
          engagementScore: p.engagementScore,
          qualificationLevel: p.qualificationLevel,
          isQualified: p.isQualified,
        },
        update: {
          pagesViewed: p.pagesViewed,
          totalTimeSpent: p.totalTimeSpent,
          interactions: p.interactions,
          conversions: p.conversions,
          lastActivityAt: p.lastActivityAt,
          viewScore: p.viewScore,
          timeScore: p.timeScore,
          interactionScore: p.interactionScore,
          conversionScore: p.conversionScore,
          engagementScore: p.engagementScore,
          qualificationLevel: p.qualificationLevel,
          isQualified: p.isQualified,
        },
      });
      count++;
    }
  }
  return count;
}
