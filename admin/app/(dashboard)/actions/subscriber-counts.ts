"use server";

import { db } from "@/lib/db";

/**
 * Newsletter subscribers, by the states an admin acts on.
 * Growth (new this month) and the one compliance risk (consent not recorded)
 * are what earn attention; unsubscribes are a plain fact.
 */

export interface SubscriberCounts {
  total: number;
  active: number;
  unsubscribed: number;
  /** Joined in the last 30 days and still subscribed — this month's growth. */
  newLast30: number;
  /** Subscribed but no GDPR consent recorded — a compliance gap to fix. */
  noConsent: number;
}

export async function getSubscriberCounts(): Promise<SubscriberCounts> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [total, active, unsubscribed, newLast30, noConsent] = await Promise.all([
    db.subscriber.count(),
    db.subscriber.count({ where: { subscribed: true } }),
    db.subscriber.count({ where: { subscribed: false } }),
    db.subscriber.count({ where: { subscribed: true, subscribedAt: { gte: since } } }),
    db.subscriber.count({ where: { subscribed: true, consentGiven: false } }),
  ]);

  return { total, active, unsubscribed, newLast30, noConsent };
}
