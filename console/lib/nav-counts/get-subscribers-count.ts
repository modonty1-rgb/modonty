import { db } from "@/lib/db";

export async function getSubscribersCount(clientId: string): Promise<number> {
  return db.subscriber.count({
    where: { clientId, subscribed: true },
  });
}
