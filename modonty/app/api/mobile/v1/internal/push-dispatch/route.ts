import { timingSafeEqual } from "node:crypto";

import { db } from "@/lib/db";
import { fail, handle, ok } from "@/lib/mobile-api/http";
import { checkReaderPushReceipts } from "@modonty/shared/lib/reader-push/check-reader-push-receipts";
import { NOT_PUSHED, pushReaderNotifications } from "@modonty/shared/lib/reader-push/push-reader-notifications";

export const maxDuration = 60;

const WINDOW_MS = 24 * 60 * 60 * 1000;
/** الكونسول يدفع لحظة الكتابة (`fireReaderPush`)؛ لا تنافسه على صفّ عمره أقلّ من دقيقتين. */
const GRACE_MS = 2 * 60 * 1000;
const BATCH = 500;

function authorized(request: Request, expected: string): boolean {
  const provided = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * N4 — GET /api/mobile/v1/internal/push-dispatch · Vercel Cron كل ١٥ دقيقة (`vercel.json`) ·
 * `Authorization: Bearer $CRON_SECRET` — Vercel يرسله لمسارات الكرون (توثيق Vercel: Securing cron jobs).
 * يرفض العمل إن لم يُضبط.
 *
 * الدفع نفسه يحدث لحظة الحدث في الكونسول. هذه المهمّة شبكة أمان، وتعيد العمل بأمان لو تكرّرت أو فاتت
 * (توثيق Vercel: «idempotent and reconciliation-based»):
 *   ١. ما فات — إشعار قارئ من آخر ٢٤ ساعة لم يُدفع (سقوط شبكة/Expo) ← يُدفع الآن، بنفس الحجز.
 *   ٢. الإيصالات — تذاكر عمرها ١٥ دقيقة فأكثر ← DeviceNotRegistered يوقف الجهاز.
 */
export const GET = handle("internal-push-dispatch", async (request: Request) => {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    console.error("[mobile-api:internal-push-dispatch] CRON_SECRET is not set — refusing to run");
    return fail("INTERNAL_ERROR", "CRON_SECRET is not configured");
  }
  if (!authorized(request, expected)) return fail("UNAUTHORIZED", "Unauthorized");

  const now = Date.now();
  const missed = await db.notification.findMany({
    where: {
      userId: { not: null },
      createdAt: { gte: new Date(now - WINDOW_MS), lte: new Date(now - GRACE_MS) },
      ...NOT_PUSHED,
    },
    orderBy: { createdAt: "asc" },
    take: BATCH,
    select: { id: true },
  });

  const pushed = await pushReaderNotifications(missed.map((n) => n.id));
  const receipts = await checkReaderPushReceipts();

  return ok({ missed: missed.length, ...pushed, receipts });
});
