"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { markNotificationReadAs } from "../helpers/mark-notification-read-as";

/** Web door: identity from the session cookie; the update lives in `markNotificationReadAs` (shared with the mobile API). */
export async function markNotificationAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await markNotificationReadAs(session.user.id, notificationId);
  revalidatePath("/");
}
