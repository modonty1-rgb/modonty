import { db } from "@/lib/db";

export interface SubscriberWithDetails {
  id: string;
  email: string;
  name: string | null;
  subscribed: boolean;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
  consentGiven: boolean;
  consentDate: Date | null;
  preferences: any;
  createdAt: Date;
  updatedAt: Date;
}

export async function getSubscribers(
  clientId: string,
  activeOnly: boolean = false
): Promise<SubscriberWithDetails[]> {
  return db.subscriber.findMany({
    where: {
      clientId,
      ...(activeOnly && { subscribed: true }),
    },
    orderBy: {
      subscribedAt: "desc",
    },
  }) as Promise<SubscriberWithDetails[]>;
}

export async function getSubscriberStats(clientId: string) {
  const [total, active, unsubscribed, withConsent, thisMonth] =
    await Promise.all([
      db.subscriber.count({
        where: { clientId },
      }),
      db.subscriber.count({
        where: { clientId, subscribed: true },
      }),
      db.subscriber.count({
        where: { clientId, subscribed: false },
      }),
      db.subscriber.count({
        where: { clientId, consentGiven: true },
      }),
      db.subscriber.count({
        where: {
          clientId,
          subscribedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

  return {
    total,
    active,
    unsubscribed,
    withConsent,
    thisMonth,
  };
}

export async function searchSubscribers(clientId: string, query: string) {
  return db.subscriber.findMany({
    where: {
      clientId,
      OR: [
        { email: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: {
      subscribedAt: "desc",
    },
  });
}
