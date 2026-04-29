"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { messages } from "@/lib/messages";
import type { Prisma } from "@prisma/client";

export interface NotificationPreferences {
  articlePublished?: boolean;
  articleApproved?: boolean;
  commentsNew?: boolean;
  supportReplies?: boolean;
}

type Result = { success: true } | { success: false; error: string };

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

function sanitizePrefs(input: unknown): NotificationPreferences {
  const out: NotificationPreferences = {};
  if (!input || typeof input !== "object") return out;
  const raw = input as Record<string, unknown>;

  if (typeof raw.articlePublished === "boolean")
    out.articlePublished = raw.articlePublished;
  if (typeof raw.articleApproved === "boolean")
    out.articleApproved = raw.articleApproved;
  if (typeof raw.commentsNew === "boolean") out.commentsNew = raw.commentsNew;
  if (typeof raw.supportReplies === "boolean")
    out.supportReplies = raw.supportReplies;

  return out;
}

export async function updateNotificationPreferences(
  prefs: NotificationPreferences
): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const clean = sanitizePrefs(prefs);

  try {
    await db.client.update({
      where: { id: clientId },
      data: {
        notificationPreferences: clean as Prisma.InputJsonValue,
      },
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
