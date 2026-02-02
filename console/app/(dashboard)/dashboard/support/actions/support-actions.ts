"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
