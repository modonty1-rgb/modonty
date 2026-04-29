import { db } from "@/lib/db";

export type ContactStatus = "new" | "read" | "replied" | "archived";

export interface ContactMessageWithDetails {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  replyBody: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  createdAt: Date;
  updatedAt: Date;
  readAt: Date | null;
  repliedAt: Date | null;
}

export interface MessageStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  archived: number;
}

export async function getContactMessages(
  clientId: string,
  status?: string
): Promise<ContactMessageWithDetails[]> {
  return db.contactMessage.findMany({
    where: {
      clientId,
      ...(status && status !== "all" && { status }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      subject: true,
      message: true,
      status: true,
      replyBody: true,
      ipAddress: true,
      userAgent: true,
      referrer: true,
      createdAt: true,
      updatedAt: true,
      readAt: true,
      repliedAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function getNewSupportMessagesCount(clientId: string): Promise<number> {
  return db.contactMessage.count({
    where: { clientId, status: "new" },
  });
}

export async function getMessageStats(clientId: string): Promise<MessageStats> {
  const [total, newMessages, readMessages, repliedMessages, archivedMessages] =
    await Promise.all([
      db.contactMessage.count({ where: { clientId } }),
      db.contactMessage.count({ where: { clientId, status: "new" } }),
      db.contactMessage.count({ where: { clientId, status: "read" } }),
      db.contactMessage.count({ where: { clientId, status: "replied" } }),
      db.contactMessage.count({ where: { clientId, status: "archived" } }),
    ]);

  return {
    total,
    new: newMessages,
    read: readMessages,
    replied: repliedMessages,
    archived: archivedMessages,
  };
}
