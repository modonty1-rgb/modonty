"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email/resend-client";

export async function updateMessageStatus(
  messageId: string,
  clientId: string,
  status: "new" | "read" | "replied" | "archived"
) {
  try {
    const message = await db.contactMessage.findFirst({
      where: {
        id: messageId,
        clientId,
      },
    });

    if (!message) {
      return { success: false, error: "Message not found" };
    }

    const updateData: any = { status };

    if (status === "read" && !message.readAt) {
      updateData.readAt = new Date();
    }

    if (status === "replied" && !message.repliedAt) {
      updateData.repliedAt = new Date();
    }

    await db.contactMessage.update({
      where: { id: messageId },
      data: updateData,
    });

    revalidatePath("/dashboard/support");
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Update failed";
    return { success: false, error: errorMessage };
  }
}

export async function deleteMessage(messageId: string, clientId: string) {
  try {
    const message = await db.contactMessage.findFirst({
      where: {
        id: messageId,
        clientId,
      },
    });

    if (!message) {
      return { success: false, error: "Message not found" };
    }

    await db.contactMessage.delete({
      where: { id: messageId },
    });

    revalidatePath("/dashboard/support");
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: errorMessage };
  }
}

export async function bulkUpdateMessages(
  messageIds: string[],
  clientId: string,
  status: "new" | "read" | "replied" | "archived"
) {
  try {
    await db.contactMessage.updateMany({
      where: {
        id: { in: messageIds },
        clientId,
      },
      data: { status },
    });

    revalidatePath("/dashboard/support");
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Bulk update failed";
    return { success: false, error: errorMessage };
  }
}

export async function sendReply(
  messageId: string,
  clientId: string,
  replyBody: string,
  replyViaEmail: boolean
) {
  try {
    const message = await db.contactMessage.findFirst({
      where: { id: messageId, clientId },
      select: { id: true, email: true, subject: true, userId: true },
    });
    if (!message) {
      return { success: false, error: "Message not found" };
    }

    const trimmedBody = replyBody.trim();
    if (!trimmedBody) {
      return { success: false, error: "Reply text is required" };
    }

    await db.contactMessage.update({
      where: { id: messageId },
      data: {
        replyBody: trimmedBody,
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
          text: trimmedBody,
        });
      } catch {
        emailFailed = true;
      }
    }

    // Brand replied → notify the user who sent the message
    if (message.userId) {
      const snippet =
        trimmedBody.length > 200 ? `${trimmedBody.slice(0, 200)}...` : trimmedBody;
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
    }

    revalidatePath("/dashboard/support");
    if (emailFailed) {
      return { success: true, emailFailed: true };
    }
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Send reply failed";
    return { success: false, error: errorMessage };
  }
}
