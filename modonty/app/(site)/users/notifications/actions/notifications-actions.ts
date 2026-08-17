"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function markNotificationAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await db.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { readAt: new Date() },
  });
  revalidatePath("/");
}
