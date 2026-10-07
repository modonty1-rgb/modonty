import { db } from "@/lib/db";

import { getContactRequestScope } from "@/lib/contact-requests/get-contact-request-scope";

/** The red number on «المبيعات» — new requests this staff member is responsible for. */
export async function countNewContactRequests(staffId: string): Promise<number> {
  const scope = await getContactRequestScope(staffId);
  if (!scope) return 0;
  return db.bookingRequest.count({ where: { ...scope, status: "new" } });
}
