"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email/resend-client";

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export interface ContactMessageFilters {
  status?: string;
  clientId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export async function getContactMessages(filters?: ContactMessageFilters) {
  try {
    const where: any = {};

    if (filters?.status && filters.status !== "all") {
      where.status = filters.status;
    }

    if (filters?.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { subject: { contains: filters.search, mode: "insensitive" } },
        { message: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const messages = await db.contactMessage.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        status: true,
        createdAt: true,
        readAt: true,
        repliedAt: true,
        client: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return messages;
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return [];
  }
}

export async function getContactMessageById(id: string) {
  try {
    const message = await db.contactMessage.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            slug: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return message;
  } catch (error) {
    console.error("Error fetching contact message:", error);
    return null;
  }
}

export async function updateContactMessageStatus(id: string, status: string) {
  const session = await auth(); if (!session) return { success: false, error: "Unauthorized" };
  try {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === "read" && !updateData.readAt) {
      updateData.readAt = new Date();
    }

    if (status === "replied") {
      updateData.repliedAt = new Date();
    }

    const message = await db.contactMessage.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/contact-messages");
    revalidatePath(`/contact-messages/${id}`);
    return { success: true, message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update contact message status";
    return { success: false, error: message };
  }
}

export async function markAsRead(id: string) {
  const session = await auth(); if (!session) return { success: false, error: "Unauthorized" };
  try {
    const message = await db.contactMessage.update({
      where: { id },
      data: {
        status: "read",
        readAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/contact-messages");
    revalidatePath(`/contact-messages/${id}`);
    return { success: true, message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark message as read";
    return { success: false, error: message };
  }
}

export async function markAsReplied(id: string) {
  const session = await auth(); if (!session) return { success: false, error: "Unauthorized" };
  try {
    const message = await db.contactMessage.update({
      where: { id },
      data: {
        status: "replied",
        repliedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/contact-messages");
    revalidatePath(`/contact-messages/${id}`);
    return { success: true, message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark message as replied";
    return { success: false, error: message };
  }
}

/**
 * Reply to a contact message from inside the dashboard — stores the reply, marks the
 * message "replied", and (by default) emails the sender via Resend. Mirrors the client
 * console's sendReply so admins don't need an external mail client.
 */
export async function sendContactReply(id: string, replyBody: string, viaEmail: boolean = true) {
  const session = await auth(); if (!session) return { success: false, error: "Unauthorized" };

  const body = replyBody?.trim();
  if (!body) return { success: false, error: "Reply cannot be empty" };

  try {
    const message = await db.contactMessage.findUnique({
      where: { id },
      select: { id: true, email: true, subject: true },
    });
    if (!message) return { success: false, error: "Message not found" };

    await db.contactMessage.update({
      where: { id },
      data: { replyBody: body, status: "replied", repliedAt: new Date(), updatedAt: new Date() },
    });

    let emailFailed = false;
    if (viaEmail) {
      try {
        await sendEmail({
          from: process.env.RESEND_FROM || "Modonty <noreply@modonty.com>",
          to: message.email,
          subject: `Re: ${message.subject}`,
          html: `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:14px;line-height:1.7;color:#111;white-space:pre-wrap">${escapeHtml(body)}</div>`,
          text: body,
        });
      } catch {
        emailFailed = true; // reply is saved either way — surface the email failure to the admin
      }
    }

    revalidatePath("/contact-messages");
    revalidatePath(`/contact-messages/${id}`);
    return emailFailed ? { success: true, emailFailed: true } : { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to send reply";
    return { success: false, error: msg };
  }
}

export async function deleteContactMessage(id: string) {
  const session = await auth(); if (!session) return { success: false, error: "Unauthorized" };
  try {
    await db.contactMessage.delete({ where: { id } });
    revalidatePath("/contact-messages");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete contact message";
    return { success: false, error: message };
  }
}

export async function getContactMessagesStats() {
  try {
    const [total, newCount, readCount, repliedCount, archivedCount] = await Promise.all([
      db.contactMessage.count(),
      db.contactMessage.count({ where: { status: "new" } }),
      db.contactMessage.count({ where: { status: "read" } }),
      db.contactMessage.count({ where: { status: "replied" } }),
      db.contactMessage.count({ where: { status: "archived" } }),
    ]);

    return {
      total,
      new: newCount,
      read: readCount,
      replied: repliedCount,
      archived: archivedCount,
    };
  } catch (error) {
    console.error("Error fetching contact messages stats:", error);
    return {
      total: 0,
      new: 0,
      read: 0,
      replied: 0,
      archived: 0,
    };
  }
}

export async function getNewContactMessagesCount() {
  try {
    const count = await db.contactMessage.count({ where: { status: "new" } });
    return count;
  } catch (error) {
    console.error("Error fetching new contact messages count:", error);
    return 0;
  }
}
