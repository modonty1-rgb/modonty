"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
      include: {
        client: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
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

export async function deleteContactMessage(id: string) {
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
