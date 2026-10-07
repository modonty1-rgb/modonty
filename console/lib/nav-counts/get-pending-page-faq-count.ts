import { db } from "@/lib/db";

/** Unanswered reader submissions awaiting the client's reply (sidebar badge). */
export async function getPendingPageFaqCount(clientId: string): Promise<number> {
  return db.clientFAQ.count({ where: { clientId, status: "PENDING" } });
}
