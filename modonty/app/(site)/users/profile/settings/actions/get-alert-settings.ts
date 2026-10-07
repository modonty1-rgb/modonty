"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { type AlertTopicId } from "@/lib/users/alert-topics";
import { readAlertPreferences } from "@/lib/users/read-alert-preferences";
import type { AlertSettings } from "../helpers/schemas/alerts-schema";

/** The signed-in reader's alert choices, for the «التنبيهات» section. */
export async function getAlertSettings(): Promise<{ success: true; data: AlertSettings } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, phone: true, notificationPreferences: true },
  });
  if (!user) return { success: false, error: "Unauthorized" };
  const prefs = readAlertPreferences(user.notificationPreferences);
  const topics: AlertSettings["topics"] = {};
  for (const [id, t] of Object.entries(prefs.topics)) topics[id as AlertTopicId] = t!.channels;
  return { success: true, data: { email: user.email, phone: user.phone, marketingEmails: prefs.marketingEmails, topics } };
}
