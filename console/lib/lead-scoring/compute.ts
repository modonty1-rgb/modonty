import { db } from "@/lib/db";

const DAYS_WINDOW = 30;
const HOT_THRESHOLD = 70;
const WARM_THRESHOLD = 40;
const QUALIFIED_THRESHOLD = 60;

export type QualificationLevel = "HOT" | "WARM" | "COLD";

export interface LeadScorePayload {
  userId: string | null;
  sessionId: string | null;
  email: string | null;
  phone: string | null;
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
  qualificationLevel: QualificationLevel;
  isQualified: boolean;
}

export interface RefreshResult {
  processed: number;
  created: number;
  updated: number;
  deletedStale: number;
}

function since() {
  const d = new Date();
  d.setDate(d.getDate() - DAYS_WINDOW);
  return d;
}

function levelFor(score: number): QualificationLevel {
  if (score >= HOT_THRESHOLD) return "HOT";
  if (score >= WARM_THRESHOLD) return "WARM";
  return "COLD";
}

interface RawAggregate {
  userId: string | null;
  sessionId: string | null;
  pagesViewed: number;
  totalTimeSpent: number;
  interactions: number;
  conversions: number;
  lastActivityAt: Date | null;
}

/**
 * Computes lead-scoring payloads for all visitors active in the last 30 days.
 * Merges anonymous sessions into known users when a sessionId↔userId link is observed.
 * Populates email/phone from the User table (when available).
 */
export async function computeLeadScoresForClient(
  clientId: string
): Promise<LeadScorePayload[]> {
  const sinceDate = since();

  const [articleViews, clientViews, analytics, ctaClicks, conversions] =
    await Promise.all([
      db.articleView.findMany({
        where: { article: { clientId }, createdAt: { gte: sinceDate } },
        select: { userId: true, sessionId: true, createdAt: true },
      }),
      db.clientView.findMany({
        where: { clientId, createdAt: { gte: sinceDate } },
        select: { userId: true, sessionId: true, createdAt: true },
      }),
      db.analytics.findMany({
        where: { clientId, timestamp: { gte: sinceDate } },
        select: { userId: true, sessionId: true, timeOnPage: true, timestamp: true },
      }),
      db.cTAClick.findMany({
        where: { clientId, createdAt: { gte: sinceDate } },
        select: { userId: true, sessionId: true, createdAt: true },
      }),
      db.conversion.findMany({
        where: { clientId, createdAt: { gte: sinceDate } },
        select: { userId: true, sessionId: true, createdAt: true },
      }),
    ]);

  // Build sessionId → userId map from any event that has both. This lets us
  // merge anonymous activity into the user row when the visitor later signs in.
  const sessionToUser = new Map<string, string>();
  for (const list of [articleViews, clientViews, analytics, ctaClicks, conversions]) {
    for (const ev of list as Array<{ userId: string | null; sessionId: string | null }>) {
      if (ev.userId && ev.sessionId && !sessionToUser.has(ev.sessionId)) {
        sessionToUser.set(ev.sessionId, ev.userId);
      }
    }
  }

  function resolveKey(uid: string | null, sid: string | null): { key: string; userId: string | null; sessionId: string | null } | null {
    if (uid) return { key: `u:${uid}`, userId: uid, sessionId: null };
    if (sid) {
      const linked = sessionToUser.get(sid);
      if (linked) return { key: `u:${linked}`, userId: linked, sessionId: null };
      return { key: `s:${sid}`, userId: null, sessionId: sid };
    }
    return null;
  }

  const agg = new Map<string, RawAggregate>();

  function bump(
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
    const k = resolveKey(uid, sid);
    if (!k) return;
    let a = agg.get(k.key);
    if (!a) {
      a = {
        userId: k.userId,
        sessionId: k.sessionId,
        pagesViewed: 0,
        totalTimeSpent: 0,
        interactions: 0,
        conversions: 0,
        lastActivityAt: null,
      };
      agg.set(k.key, a);
    }
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

  articleViews.forEach((v) => bump(v.userId, v.sessionId, { pagesViewed: 1, lastActivityAt: v.createdAt }));
  clientViews.forEach((v) => bump(v.userId, v.sessionId, { pagesViewed: 1, lastActivityAt: v.createdAt }));
  analytics.forEach((a) => bump(a.userId, a.sessionId, { totalTimeSpent: a.timeOnPage ?? 0, lastActivityAt: a.timestamp }));
  ctaClicks.forEach((c) => bump(c.userId, c.sessionId, { interactions: 1, lastActivityAt: c.createdAt }));
  conversions.forEach((c) => bump(c.userId, c.sessionId, { conversions: 1, lastActivityAt: c.createdAt }));

  // Bulk-fetch contact info for all known users in one pass.
  // Email comes from User.email. The schema has no per-user phone today,
  // so phone stays null until a "request callback" capture path is added.
  const userIds = Array.from(agg.values())
    .map((a) => a.userId)
    .filter((id): id is string => !!id);

  const userInfo = new Map<string, { email: string | null; phone: string | null }>();
  if (userIds.length > 0) {
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true },
    });
    for (const u of users) {
      userInfo.set(u.id, { email: u.email ?? null, phone: null });
    }
  }

  const payloads: LeadScorePayload[] = [];
  for (const a of agg.values()) {
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
    const qualificationLevel = levelFor(engagementScore);
    const isQualified = engagementScore >= QUALIFIED_THRESHOLD;

    const contact = a.userId ? userInfo.get(a.userId) : undefined;

    payloads.push({
      userId: a.userId,
      sessionId: a.sessionId,
      email: contact?.email ?? null,
      phone: contact?.phone ?? null,
      clientId,
      pagesViewed: a.pagesViewed,
      totalTimeSpent: a.totalTimeSpent,
      interactions: a.interactions,
      conversions: a.conversions,
      lastActivityAt: a.lastActivityAt,
      viewScore: Math.round(viewScore),
      timeScore: Math.round(timeScore),
      interactionScore: Math.round(interactionScore),
      conversionScore: Math.round(conversionScore),
      engagementScore,
      qualificationLevel,
      isQualified,
    });
  }

  return payloads;
}

/**
 * Upserts the new payloads and DELETES any existing leads that no longer
 * have activity in the rolling window (cleans stale HOT leads from months ago).
 */
export async function refreshLeadScoring(
  clientId: string,
  payloads: LeadScorePayload[]
): Promise<RefreshResult> {
  // Track which leads are "current" (referenced in payloads)
  const currentKeys = new Set<string>();
  for (const p of payloads) {
    if (p.userId) currentKeys.add(`u:${p.userId}`);
    else if (p.sessionId) currentKeys.add(`s:${p.sessionId}`);
  }

  // Existing leads for this client
  const existing = await db.leadScoring.findMany({
    where: { clientId },
    select: { id: true, userId: true, sessionId: true },
  });

  const staleIds: string[] = [];
  for (const l of existing) {
    const k = l.userId ? `u:${l.userId}` : l.sessionId ? `s:${l.sessionId}` : null;
    if (!k || !currentKeys.has(k)) staleIds.push(l.id);
  }

  // Run upserts in parallel batches (concurrency 10) — solves the N+1 await.
  const CONCURRENCY = 10;
  let created = 0;
  let updated = 0;

  async function upsertOne(p: LeadScorePayload): Promise<"created" | "updated" | "skipped"> {
    const data = {
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
      email: p.email,
      phone: p.phone,
    };

    if (p.userId) {
      const existed = await db.leadScoring.findUnique({
        where: { userId_clientId: { userId: p.userId, clientId: p.clientId } },
        select: { id: true },
      });
      await db.leadScoring.upsert({
        where: { userId_clientId: { userId: p.userId, clientId: p.clientId } },
        create: { userId: p.userId, clientId: p.clientId, sessionId: null, ...data },
        update: data,
      });
      return existed ? "updated" : "created";
    }
    if (p.sessionId) {
      const existed = await db.leadScoring.findUnique({
        where: { sessionId_clientId: { sessionId: p.sessionId, clientId: p.clientId } },
        select: { id: true },
      });
      await db.leadScoring.upsert({
        where: { sessionId_clientId: { sessionId: p.sessionId, clientId: p.clientId } },
        create: { sessionId: p.sessionId, clientId: p.clientId, userId: null, ...data },
        update: data,
      });
      return existed ? "updated" : "created";
    }
    return "skipped";
  }

  for (let i = 0; i < payloads.length; i += CONCURRENCY) {
    const slice = payloads.slice(i, i + CONCURRENCY);
    const results = await Promise.all(slice.map(upsertOne));
    for (const r of results) {
      if (r === "created") created++;
      else if (r === "updated") updated++;
    }
  }

  let deletedStale = 0;
  if (staleIds.length > 0) {
    const del = await db.leadScoring.deleteMany({
      where: { id: { in: staleIds } },
    });
    deletedStale = del.count;
  }

  return {
    processed: created + updated,
    created,
    updated,
    deletedStale,
  };
}

/** Backward-compat: thin wrapper used by older callers. */
export async function upsertLeadScoring(payloads: LeadScorePayload[]): Promise<number> {
  if (payloads.length === 0) return 0;
  const clientId = payloads[0].clientId;
  const result = await refreshLeadScoring(clientId, payloads);
  return result.processed;
}
