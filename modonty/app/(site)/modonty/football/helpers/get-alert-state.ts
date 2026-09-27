import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { readAlertPreferences } from "@/lib/users/read-alert-preferences";

export type AlertState = { kind: "guest" } | { kind: "member" } | { kind: "on" };

/**
 * Where this reader stands with the football alert — read per request (it needs the session), so
 * every caller sits inside its own Suspense. One reader for the hero and the card, so the two can
 * never disagree about the same reader.
 */
export async function getAlertState(): Promise<AlertState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { kind: "guest" };

  const user = await db.user.findUnique({ where: { id: userId }, select: { notificationPreferences: true } });
  return readAlertPreferences(user?.notificationPreferences).topics.football ? { kind: "on" } : { kind: "member" };
}
