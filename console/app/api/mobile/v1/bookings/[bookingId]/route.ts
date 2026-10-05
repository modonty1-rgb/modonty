import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { NEXT_BOOKING_STATUS } from "@/lib/mobile-api/booking-status";
import { fail, ok } from "@/lib/mobile-api/http";
import { rejectMalformedIds } from "@/lib/mobile-api/params";

/**
 * تقديم طلب تواصل خطوةً واحدة من التطبيق (جديد ← تواصلت معه ← خلص).
 *
 * الشرط على الحالة الحالية داخل التحديث نفسه: لو غيّرها الفريق من الكونسول قبل لحظة، يرجع
 * 409 بدل أن يقفز الطلب خطوتين. ولا خطوة لطلبات واتساب — هي خبرٌ لا مهمّة.
 */
const bodySchema = z.object({ status: z.enum(["contacted", "done"]) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const { bookingId } = await params;
  const malformed = rejectMalformedIds([bookingId], "الطلب غير موجود.");
  if (malformed) return malformed;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("VALIDATION_ERROR", "طلب غير صالح.");

  const booking = await db.bookingRequest.findFirst({
    where: { id: bookingId, clientId: session.clientId, channel: "form" },
    select: { id: true, status: true },
  });
  if (!booking) return fail("NOT_FOUND", "الطلب غير موجود.");
  if (NEXT_BOOKING_STATUS[booking.status]?.key !== parsed.data.status) {
    return fail("CONFLICT", "حالة الطلب تغيّرت. حدّث الصفحة.");
  }
  const updated = await db.bookingRequest.updateMany({
    where: { id: booking.id, status: booking.status },
    data: { status: parsed.data.status },
  });
  if (updated.count === 0) return fail("CONFLICT", "حالة الطلب تغيّرت. حدّث الصفحة.");
  revalidatePath("/dashboard/bookings");
  return ok({ booking: { id: booking.id, status: parsed.data.status } });
}
