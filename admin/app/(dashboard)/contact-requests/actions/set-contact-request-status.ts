"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit/log-action";
import { CONTACT_REQUEST_STATUSES, CONTACT_REQUEST_STATUS_LABEL } from "../helpers/contact-request-statuses";
import { getContactRequestScope } from "@/lib/contact-requests/get-contact-request-scope";

const schema = z.object({
  id: z.string().regex(/^[0-9a-f]{24}$/i),
  status: z.enum(CONTACT_REQUEST_STATUSES),
});

/**
 * The rep moves a reader's contact request after asking the client what happened (plan ج٨).
 * The scope check runs on the row itself: a SALES rep can only move requests of the clients
 * they manage, even with a hand-made request id.
 */
export async function setContactRequestStatus(input: { id: string; status: string }): Promise<{ ok: boolean; error?: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "بيانات غير صالحة" };
  const { id, status } = parsed.data;

  const staffId = ((await auth().catch(() => null))?.user as { id?: string } | undefined)?.id;
  if (!staffId) return { ok: false, error: "سجّل الدخول من جديد" };
  const scope = await getContactRequestScope(staffId);
  if (!scope) return { ok: false, error: "هذه الصفحة للمبيعات والأدمن" };

  const request = await db.bookingRequest.findFirst({
    where: { AND: [scope, { id }] },
    select: { status: true, client: { select: { name: true } } },
  });
  if (!request) return { ok: false, error: "الطلب مو موجود أو مو لعملائك" };
  if (request.status === status) return { ok: true };

  await db.bookingRequest.update({ where: { id }, data: { status } });

  const from = CONTACT_REQUEST_STATUS_LABEL[request.status as keyof typeof CONTACT_REQUEST_STATUS_LABEL] ?? request.status;
  await logAction("contactRequest.status", {
    entity: "BookingRequest",
    entityId: id,
    summary: `طلب تواصل لـ${request.client.name}: ${from} ← ${CONTACT_REQUEST_STATUS_LABEL[status]}`,
    metadata: { from: request.status, to: status },
  });

  // The page, and the layout that draws the red count on «المبيعات».
  revalidatePath("/contact-requests");
  revalidatePath("/", "layout");
  return { ok: true };
}
