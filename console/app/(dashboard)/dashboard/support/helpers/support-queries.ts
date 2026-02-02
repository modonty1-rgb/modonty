import { db } from "@/lib/db";

export async function getClientMessages(clientId: string, limit = 50) {
  return db.contactMessage.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
