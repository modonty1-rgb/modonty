"use server";

import type { Prisma } from "@prisma/client";
import { refresh } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ALERT_TOPIC_IDS } from "@/lib/users/alert-topics";
import { readAlertPreferences } from "@/lib/users/read-alert-preferences";
import { startTopicAlert } from "@/lib/users/start-topic-alert";

const topicSchema = z.enum(ALERT_TOPIC_IDS);

/**
 * «نبّهني» on a sector page — one press records the signed-in reader's consent to that sector's
 * alert, right on the page (a Google sign-up never saw the registration box, and older accounts
 * predate it). Bound per page (`enableTopicAlert.bind(null, "ai")`); the topic is still checked here,
 * since a server action is a public endpoint. Other keys in the JSON column are kept, and a reader
 * already subscribed keeps the channels they chose.
 */
export async function enableTopicAlert(rawTopic: string): Promise<void> {
  const parsed = topicSchema.safeParse(rawTopic);
  if (!parsed.success) return;
  const topic = parsed.data;

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  const user = await db.user.findUnique({ where: { id: userId }, select: { notificationPreferences: true } });
  if (readAlertPreferences(user?.notificationPreferences).topics[topic]) return;

  // The column is free JSON; every value read back out of it is already valid JSON input.
  const prefs = user?.notificationPreferences && typeof user.notificationPreferences === "object" ? (user.notificationPreferences as Prisma.JsonObject) : {};
  const topics = prefs.topics && typeof prefs.topics === "object" ? (prefs.topics as Prisma.JsonObject) : {};

  await db.user.update({
    where: { id: userId },
    data: { notificationPreferences: { ...prefs, topics: { ...topics, [topic]: startTopicAlert() } } },
  });
  refresh();
}
