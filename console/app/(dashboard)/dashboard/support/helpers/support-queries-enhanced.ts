import { db } from "@/lib/db";

export interface ContactMessageWithDetails {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  createdAt: Date;
  updatedAt: Date;
  readAt: Date | null;
  repliedAt: Date | null;
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
    orderBy: {
      createdAt: "desc",
    },
  }) as Promise<ContactMessageWithDetails[]>;
}

export async function getMessageStats(clientId: string) {
  const [total, newMessages, readMessages, repliedMessages, archivedMessages] =
    await Promise.all([
      db.contactMessage.count({
        where: { clientId },
      }),
      db.contactMessage.count({
        where: { clientId, status: "new" },
      }),
      db.contactMessage.count({
        where: { clientId, status: "read" },
      }),
      db.contactMessage.count({
        where: { clientId, status: "replied" },
      }),
      db.contactMessage.count({
        where: { clientId, status: "archived" },
      }),
    ]);

  return {
    total,
    new: newMessages,
    read: readMessages,
    replied: repliedMessages,
    archived: archivedMessages,
  };
}

export async function searchMessages(clientId: string, query: string) {
  return db.contactMessage.findMany({
    where: {
      clientId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { subject: { contains: query, mode: "insensitive" } },
        { message: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
