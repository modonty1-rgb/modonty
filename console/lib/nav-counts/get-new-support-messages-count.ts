import { db } from "@/lib/db";

export async function getNewSupportMessagesCount(clientId: string): Promise<number> {
  return db.contactMessage.count({
    where: { clientId, status: "new" },
  });
}
