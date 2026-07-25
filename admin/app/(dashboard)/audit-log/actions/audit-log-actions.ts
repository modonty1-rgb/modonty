"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export interface AuditLogRow {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  userRole: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  summary: string | null;
  createdAt: Date;
}

interface GetAuditLogsOptions {
  /** Scope the feed to a single actor — used by the per-admin "Audit Log" button. */
  userId?: string;
  /** Newest-first cap. The table filters the rest client-side (volume is low). */
  limit?: number;
}

export interface StaffActivitySummary {
  total: number;
  last7: number;
  last30: number;
  lastActiveAt: Date | null;
  /** Per-area totals (Articles · Clients · Media · Billing · Reference · Staff · System). */
  byEntity: Array<{ entity: string; count: number }>;
  /** Most-used actions, most first. */
  topActions: Array<{ action: string; count: number }>;
  /** Last 14 days, oldest → newest, one bucket per day (yyyy-mm-dd). */
  daily: Array<{ day: string; count: number }>;
}

// The numbers behind "what has this person been doing" — counts, areas, top actions,
// and a 14-day rhythm. All scoped to one staff member. Never throws.
export async function getStaffActivitySummary(userId: string): Promise<StaffActivitySummary> {
  const empty: StaffActivitySummary = {
    total: 0, last7: 0, last30: 0, lastActiveAt: null, byEntity: [], topActions: [], daily: [],
  };
  try {
    const session = await auth();
    if (!session?.user) return empty;

    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const d7 = new Date(now.getTime() - 7 * dayMs);
    const d30 = new Date(now.getTime() - 30 * dayMs);
    const d14 = new Date(now.getTime() - 14 * dayMs);

    const [total, last7, last30, byEntityRaw, byActionRaw, latest, recent] = await Promise.all([
      db.auditLog.count({ where: { userId } }),
      db.auditLog.count({ where: { userId, createdAt: { gte: d7 } } }),
      db.auditLog.count({ where: { userId, createdAt: { gte: d30 } } }),
      db.auditLog.groupBy({ by: ["entity"], where: { userId }, _count: { _all: true } }),
      db.auditLog.groupBy({ by: ["action"], where: { userId }, _count: { _all: true } }),
      db.auditLog.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
      db.auditLog.findMany({ where: { userId, createdAt: { gte: d14 } }, select: { createdAt: true } }),
    ]);

    const byEntity = byEntityRaw
      .map((g) => ({ entity: g.entity, count: g._count._all }))
      .sort((a, b) => b.count - a.count);

    const topActions = byActionRaw
      .map((g) => ({ action: g.action, count: g._count._all }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // 14 day buckets, oldest first, keyed by local yyyy-mm-dd.
    const key = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const counts = new Map<string, number>();
    for (const r of recent) counts.set(key(r.createdAt), (counts.get(key(r.createdAt)) ?? 0) + 1);
    const daily: Array<{ day: string; count: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * dayMs);
      daily.push({ day: key(d), count: counts.get(key(d)) ?? 0 });
    }

    return { total, last7, last30, lastActiveAt: latest?.createdAt ?? null, byEntity, topActions, daily };
  } catch {
    return empty;
  }
}

// Newest first — the log is read top-down. Scoped by userId when the caller drills
// into one admin. Never throws: an empty feed is a valid answer, an error page isn't.
export async function getAuditLogs({ userId, limit = 500 }: GetAuditLogsOptions = {}): Promise<AuditLogRow[]> {
  try {
    const session = await auth();
    if (!session?.user) return [];

    return await db.auditLog.findMany({
      where: userId ? { userId } : undefined,
      select: {
        id: true,
        userId: true,
        userEmail: true,
        userName: true,
        userRole: true,
        action: true,
        entity: true,
        entityId: true,
        summary: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}
