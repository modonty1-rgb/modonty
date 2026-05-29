import "server-only";
import { db } from "@/lib/db";

export interface JbrseoSubscriberRow {
  id: string;
  jbrseoId: string;
  contactName: string | null;
  email: string;
  phone: string;
  businessName: string | null;
  businessType: string | null;
  planName: string;
  planIndex: number | null;
  country: string;
  isAnnual: boolean;
  jbrseoCreatedAt: Date;
  syncedAt: Date;
  convertedToClientId: string | null;
  convertedAt: Date | null;
}

export async function getJbrseoSubscribers(): Promise<JbrseoSubscriberRow[]> {
  return db.jbrseoSubscriber.findMany({
    orderBy: { jbrseoCreatedAt: "desc" },
    take: 500,
  });
}

export interface WelcomeEmailStatus {
  delivered: boolean;
  opened: boolean;
}

/**
 * For converted clients, returns whether their welcome email was delivered/opened
 * (from Resend webhook events). Keyed by clientId.
 */
export async function getWelcomeEmailStatuses(
  clientIds: string[]
): Promise<Record<string, WelcomeEmailStatus>> {
  const map: Record<string, WelcomeEmailStatus> = {};
  if (clientIds.length === 0) return map;

  const events = await db.emailEvent.findMany({
    where: { clientId: { in: clientIds }, emailType: "client-welcome" },
    select: { clientId: true, type: true },
  });

  for (const e of events) {
    if (!e.clientId) continue;
    const s = map[e.clientId] ?? { delivered: false, opened: false };
    if (e.type === "delivered") s.delivered = true;
    if (e.type === "opened") s.opened = true;
    map[e.clientId] = s;
  }
  return map;
}

export interface JbrseoSubscriberStats {
  total: number;
  bySa: number;
  byEg: number;
  annual: number;
  monthly: number;
  lastSyncedAt: Date | null;
}

export async function getJbrseoSubscriberStats(): Promise<JbrseoSubscriberStats> {
  const [total, bySa, byEg, annual, monthly, latest] = await Promise.all([
    db.jbrseoSubscriber.count(),
    db.jbrseoSubscriber.count({ where: { country: "SA" } }),
    db.jbrseoSubscriber.count({ where: { country: "EG" } }),
    db.jbrseoSubscriber.count({ where: { isAnnual: true } }),
    db.jbrseoSubscriber.count({ where: { isAnnual: false } }),
    db.jbrseoSubscriber.findFirst({
      orderBy: { syncedAt: "desc" },
      select: { syncedAt: true },
    }),
  ]);

  return {
    total,
    bySa,
    byEg,
    annual,
    monthly,
    lastSyncedAt: latest?.syncedAt ?? null,
  };
}
