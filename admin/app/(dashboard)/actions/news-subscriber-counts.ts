"use server";

import { db } from "@/lib/db";

/**
 * Modonty newsletter subscribers (`NewsSubscriber`) — the PLATFORM's own newsletter,
 * distinct from per-client subscribers (`Subscriber`, see subscriber-counts.ts). Same
 * states an admin acts on: growth, the compliance gap (no consent), and unsubscribes.
 */

export interface NewsSubscriberCounts {
  total: number;
  active: number;
  unsubscribed: number;
  /** Joined in the last 30 days and still subscribed — this month's growth. */
  newLast30: number;
  /** Subscribed but no consent recorded — a compliance gap to fix. */
  noConsent: number;
}

export async function getNewsSubscriberCounts(): Promise<NewsSubscriberCounts> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [total, active, unsubscribed, newLast30, noConsent] = await Promise.all([
    db.newsSubscriber.count(),
    db.newsSubscriber.count({ where: { subscribed: true } }),
    db.newsSubscriber.count({ where: { subscribed: false } }),
    db.newsSubscriber.count({ where: { subscribed: true, subscribedAt: { gte: since } } }),
    db.newsSubscriber.count({ where: { subscribed: true, consentGiven: false } }),
  ]);

  return { total, active, unsubscribed, newLast30, noConsent };
}
