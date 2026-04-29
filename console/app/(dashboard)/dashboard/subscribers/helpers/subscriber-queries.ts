import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export interface SubscriberWithDetails {
  id: string;
  email: string;
  name: string | null;
  subscribed: boolean;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
  consentGiven: boolean;
  consentDate: Date | null;
  preferences: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriberStats {
  total: number;
  active: number;
  unsubscribed: number;
  withConsent: number;
  thisMonth: number;
}

const PAGE_LIMIT = 200;

/**
 * Returns up to {@link PAGE_LIMIT} subscribers for the client. Sorted newest
 * first. The Console UI further filters and searches client-side.
 */
export async function getSubscribers(
  clientId: string
): Promise<SubscriberWithDetails[]> {
  return db.subscriber.findMany({
    where: { clientId },
    orderBy: { subscribedAt: "desc" },
    take: PAGE_LIMIT,
  }) as Promise<SubscriberWithDetails[]>;
}

export async function getSubscribersCount(clientId: string): Promise<number> {
  return db.subscriber.count({
    where: { clientId, subscribed: true },
  });
}

export async function getSubscriberStats(
  clientId: string
): Promise<SubscriberStats> {
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  const [total, active, unsubscribed, withConsent, thisMonth] =
    await Promise.all([
      db.subscriber.count({ where: { clientId } }),
      db.subscriber.count({ where: { clientId, subscribed: true } }),
      db.subscriber.count({ where: { clientId, subscribed: false } }),
      db.subscriber.count({ where: { clientId, consentGiven: true } }),
      db.subscriber.count({
        where: { clientId, subscribedAt: { gte: startOfMonth } },
      }),
    ]);

  return { total, active, unsubscribed, withConsent, thisMonth };
}
