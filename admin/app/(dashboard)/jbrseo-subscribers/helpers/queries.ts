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
}

export async function getJbrseoSubscribers(): Promise<JbrseoSubscriberRow[]> {
  return db.jbrseoSubscriber.findMany({
    orderBy: { jbrseoCreatedAt: "desc" },
    take: 500,
  });
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
