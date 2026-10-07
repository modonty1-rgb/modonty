import "server-only";

import { db } from "@/lib/db";
import type { AlertChannelId, AlertTopicId } from "@/lib/users/alert-topics";
import { readAlertPreferences } from "@/lib/users/read-alert-preferences";

export interface AlertSettings {
  email: string | null;
  phone: string | null;
  marketingEmails: boolean;
  topics: Partial<Record<AlertTopicId, AlertChannelId[]>>;
}

/**
 * A known reader's alert choices, for the «التنبيهات» section — the body of `getAlertSettings`
 * with the identity passed in. `null` = no such user.
 */
export async function getAlertSettingsAs(userId: string): Promise<AlertSettings | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, phone: true, notificationPreferences: true },
  });
  if (!user) return null;
  const prefs = readAlertPreferences(user.notificationPreferences);
  const topics: AlertSettings["topics"] = {};
  for (const [id, t] of Object.entries(prefs.topics)) topics[id as AlertTopicId] = t!.channels;
  return { email: user.email, phone: user.phone, marketingEmails: prefs.marketingEmails, topics };
}
