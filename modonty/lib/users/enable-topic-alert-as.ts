import "server-only";

import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { db } from "@/lib/db";
import { ALERT_TOPIC_IDS } from "@/lib/users/alert-topics";
import { readAlertPreferences } from "@/lib/users/read-alert-preferences";
import { startTopicAlert } from "@/lib/users/start-topic-alert";

const topicSchema = z.enum(ALERT_TOPIC_IDS);

export type TopicAlertResult = "invalid" | "no_user" | "already" | "enabled";

/**
 * «نبّهني» for a known reader — the body of `enableTopicAlert` with the identity passed in. One
 * press records consent to that sector's alert (email channel, dated); other keys in the JSON
 * column are kept, and a reader already subscribed keeps the channels they chose.
 * Not a Server Action on purpose.
 */
export async function enableTopicAlertAs(userId: string, rawTopic: string): Promise<TopicAlertResult> {
  const parsed = topicSchema.safeParse(rawTopic);
  if (!parsed.success) return "invalid";
  const topic = parsed.data;

  const user = await db.user.findUnique({ where: { id: userId }, select: { notificationPreferences: true } });
  if (!user) return "no_user";
  if (readAlertPreferences(user.notificationPreferences).topics[topic]) return "already";

  // The column is free JSON; every value read back out of it is already valid JSON input.
  const prefs = user.notificationPreferences && typeof user.notificationPreferences === "object" ? (user.notificationPreferences as Prisma.JsonObject) : {};
  const topics = prefs.topics && typeof prefs.topics === "object" ? (prefs.topics as Prisma.JsonObject) : {};

  await db.user.update({
    where: { id: userId },
    data: { notificationPreferences: { ...prefs, topics: { ...topics, [topic]: startTopicAlert() } } },
  });
  return "enabled";
}
