"use server";

import { refresh } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { readAlertPreferences } from "@/lib/users/read-alert-preferences";
import { startTopicAlert } from "@/lib/users/start-topic-alert";

/**
 * «نبّهني» — one press records the signed-in reader's consent to the football alert, right on the
 * page (a Google sign-up never saw the registration box, and older accounts predate it). Other keys
 * in the JSON column are kept; a reader already subscribed keeps the channels they chose.
 */
export async function enableFootballAlert(): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  const user = await db.user.findUnique({ where: { id: userId }, select: { notificationPreferences: true } });
  if (readAlertPreferences(user?.notificationPreferences).topics.football) return;

  const prefs = user?.notificationPreferences && typeof user.notificationPreferences === "object" ? (user.notificationPreferences as Record<string, unknown>) : {};
  const topics = prefs.topics && typeof prefs.topics === "object" ? (prefs.topics as Record<string, unknown>) : {};

  await db.user.update({
    where: { id: userId },
    data: { notificationPreferences: { ...prefs, topics: { ...topics, football: startTopicAlert() } } },
  });
  refresh();
}
