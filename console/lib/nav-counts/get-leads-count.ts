import { db } from "@/lib/db";

/** Sidebar badge — count of qualified leads (≥ 60). Layout calls this. */
export async function getLeadsCount(clientId: string): Promise<number> {
  return db.leadScoring.count({
    where: { clientId, isQualified: true },
  });
}
