"use server";

import { refresh } from "next/cache";

import { auth } from "@/lib/auth";
import { enableTopicAlertAs } from "@/lib/users/enable-topic-alert-as";

/**
 * «نبّهني» on a sector page — one press records the signed-in reader's consent to that sector's
 * alert, right on the page (a Google sign-up never saw the registration box, and older accounts
 * predate it). Bound per page (`enableTopicAlert.bind(null, "ai")`); the topic is still checked
 * (inside `enableTopicAlertAs`), since a server action is a public endpoint.
 * Web door: identity from the session cookie, logic in `enableTopicAlertAs` (shared with the mobile API).
 */
export async function enableTopicAlert(rawTopic: string): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  if ((await enableTopicAlertAs(userId, rawTopic)) === "enabled") refresh();
}
