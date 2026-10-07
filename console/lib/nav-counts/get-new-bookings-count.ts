import { db } from "@/lib/db";

export async function getNewBookingsCount(clientId: string): Promise<number> {
  return db.bookingRequest.count({ where: { clientId, status: "new" } });
}
