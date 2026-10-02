import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * Which contact requests a staff member may see and move — the one rule the menu badge, the
 * page and the save action all read (Khalid, 2 Oct 2026): ADMIN sees every request; SALES sees
 * the requests of the clients they manage (`Client.salesRepId`); anyone else sees none (null).
 */
export async function getContactRequestScope(staffId: string): Promise<Prisma.BookingRequestWhereInput | null> {
  const staff = await db.staff.findUnique({ where: { id: staffId }, select: { role: true, isActive: true } });
  if (!staff || staff.isActive === false) return null;
  if (staff.role === "ADMIN") return {};
  if (staff.role === "SALES") return { client: { salesRepId: staffId } };
  return null;
}
