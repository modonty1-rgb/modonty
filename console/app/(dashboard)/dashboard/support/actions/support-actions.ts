"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email/resend-client";
import { messages } from "@/lib/messages";

type Result =
  | { success: true; emailFailed?: boolean }
  | { success: false; error: string };

type Status = "new" | "read" | "replied" | "archived";

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

async function ensureOwnedMessage(
  messageId: string,
  clientId: string
): Promise<{ id: string; readAt: Date | null; repliedAt: Date | null } | null> {
  return db.contactMessage.findFirst({
    where: { id: messageId, clientId },
    select: { id: true, readAt: true, repliedAt: true },
  });
}

export async function updateMessageStatus(
  messageId: string,
  status: Status
): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const message = await ensureOwnedMessage(messageId, clientId);
  if (!message) return { success: false, error: messages.error.notFound };

  const updateData: {
    status: Status;
    readAt?: Date;
    repliedAt?: Date;
  } = { status };

  if (status === "read" && !message.readAt) updateData.readAt = new Date();
  if (status === "replied" && !message.repliedAt) updateData.repliedAt = new Date();

  try {
    await db.contactMessage.update({
      where: { id: messageId },
      data: updateData,
    });
    revalidatePath("/dashboard/support");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function deleteMessage(messageId: string): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const message = await ensureOwnedMessage(messageId, clientId);
  if (!message) return { success: false, error: messages.error.notFound };

  try {
    await db.contactMessage.delete({ where: { id: messageId } });
    revalidatePath("/dashboard/support");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function bulkUpdateMessages(
  messageIds: string[],
  status: Status
): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  if (messageIds.length === 0) {
    return { success: false, error: messages.error.required };
  }

  try {
    await db.contactMessage.updateMany({
      where: { id: { in: messageIds }, clientId },
      data: { status },
    });
    revalidatePath("/dashboard/support");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function bulkDeleteMessages(messageIds: string[]): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  if (messageIds.length === 0) {
    return { success: false, error: messages.error.required };
  }

  try {
    await db.contactMessage.deleteMany({
      where: { id: { in: messageIds }, clientId },
    });
    revalidatePath("/dashboard/support");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function sendReply(
  messageId: string,
  replyBody: string,
  replyViaEmail: boolean
): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const trimmed = replyBody?.trim();
  if (!trimmed) return { success: false, error: messages.error.required };

  const message = await db.contactMessage.findFirst({
    where: { id: messageId, clientId },
    select: { id: true, email: true, subject: true, userId: true },
  });
  if (!message) return { success: false, error: messages.error.notFound };

  try {
    await db.contactMessage.update({
      where: { id: messageId },
      data: {
        replyBody: trimmed,
        status: "replied",
        repliedAt: new Date(),
      },
    });

    let emailFailed = false;
    if (replyViaEmail) {
      try {
        await sendEmail({
          to: message.email,
          subject: `Re: ${message.subject}`,
          text: trimmed,
        });
      } catch {
        emailFailed = true;
      }
    }

    if (message.userId) {
      const snippet =
        trimmed.length > 200 ? `${trimmed.slice(0, 200)}...` : trimmed;
      try {
        await db.notification.create({
          data: {
            userId: message.userId,
            clientId,
            type: "contact_reply",
            title: "رد على رسالتك",
            body: snippet,
            relatedId: message.id,
          },
        });
      } catch {
        // Notification failure must not block the reply
      }
    }

    revalidatePath("/dashboard/support");
    return emailFailed ? { success: true, emailFailed: true } : { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
