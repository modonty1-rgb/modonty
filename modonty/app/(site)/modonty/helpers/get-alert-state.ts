import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { AlertTopicId } from "@/lib/users/alert-topics";
import { readAlertPreferences } from "@/lib/users/read-alert-preferences";

export type AlertState = { kind: "guest" } | { kind: "member" } | { kind: "on" };

/**
 * Where this reader stands with one sector's alert — read per request (it needs the session), so
 * every caller sits inside its own Suspense. One reader for every hero and card, so two places on
 * a page can never disagree about the same reader.
 */
export async function getAlertState(topic: AlertTopicId): Promise<AlertState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { kind: "guest" };

  const user = await db.user.findUnique({ where: { id: userId }, select: { notificationPreferences: true } });
  return readAlertPreferences(user?.notificationPreferences).topics[topic] ? { kind: "on" } : { kind: "member" };
}
