import { NextResponse } from "next/server";
import type { CheckoutOrderStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { TamaraError } from "@/lib/tamara/client";
import { authoriseOrder, captureOrder, getOrder } from "@/lib/tamara/orders";
import { verifyTamaraToken } from "@/lib/tamara/webhook-token";

/**
 * مستقبِل ويبهوك تمارا (PAY-D6) — منقول من جبر سيو `app/api/webhooks/tamara/route.ts`.
 *
 * ── فحصان مستقلّان، لأن كلاًّ منهما يجيب سؤالاً آخر ──
 * ١ `tamaraToken` رمزٌ JWT موقَّع HS256 بسرّ الإشعار عندنا. التحقّق منه يُثبت **من**
 *   المتحدّث: الكلّ يستطيع إرسال POST إلى هذا العنوان، وتمارا وحدها تستطيع التوقيع.
 * ٢ ثم نسأل تمارا عن حالة الطلب فعلاً. التوقيع يقول من يتكلّم، لا أن الجسم ما زال يطابق
 *   الواقع لحظة قراءتنا له — والجسم هو ما كان سيقرّر أن أحدهم «مدفوع».
 *
 * عدم التكرار: `providerEventId` فريد، فإعادة الإرسال — من تمارا أو إعادة تشغيلٍ لطلبٍ
 * ملتقَط — تُكتب مرّةً وتُعالَج مرّة. والتكرار يُجاب بـ200 لا بخطأ: هو نجاحٌ سابق، وردٌّ
 * بخطأ يجعل تمارا تعيد ما أنجزناه.
 */

type TamaraWebhookBody = {
  order_id?: string;
  order_reference_id?: string;
  order_number?: string;
  event_type?: string;
  data?: unknown;
};

/** الترويسة أو العنوان — توثيقهم يرسله بالطريقتين. */
function extractToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return new URL(req.url).searchParams.get("tamaraToken");
}

/** حالة تمارا → حالة الطلب عندنا. `new`/`approved` ليست نتيجةً بعد فتُهمَل. */
function toOrderStatus(status: string): CheckoutOrderStatus | null {
  const s = status.toLowerCase();
  if (s === "fully_captured" || s === "partially_captured" || s === "authorised") return "PAID";
  if (s === "declined" || s === "expired") return "FAILED";
  if (s === "canceled" || s === "cancelled") return "CANCELLED";
  if (s === "fully_refunded" || s === "partially_refunded") return "REFUNDED";
  return null;
}

export async function POST(req: Request) {
  const token = extractToken(req);
  if (!token) return new NextResponse("unauthorized", { status: 401 });

  const verdict = verifyTamaraToken(token, process.env.TAMARA_NOTIFICATION_TOKEN ?? "");
  if (!verdict.ok) {
    console.error("[webhook/tamara] rejected —", verdict.reason);
    return new NextResponse("unauthorized", { status: 401 });
  }

  const rawText = await req.text();
  let body: TamaraWebhookBody;
  try {
    body = JSON.parse(rawText) as TamaraWebhookBody;
  } catch {
    return new NextResponse("bad-request", { status: 400 });
  }

  const providerOrderId = body.order_id;
  const eventType = body.event_type ?? "unknown";
  if (!providerOrderId) return new NextResponse("bad-request", { status: 400 });

  const eventId = `${providerOrderId}::${eventType}`;
  try {
    await db.paymentWebhookEvent.create({
      data: {
        provider: "TAMARA",
        providerEventId: eventId,
        eventType,
        payload: JSON.parse(rawText) as object,
      },
    });
  } catch {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  let order;
  try {
    order = await getOrder(providerOrderId);
  } catch (err) {
    console.error("[webhook/tamara] order lookup failed", err);
    // 500 كي تعيد تمارا الإرسال، ويُحذف صفّ الحدث فلا يمنع الإعادة من العمل.
    await db.paymentWebhookEvent.delete({ where: { providerEventId: eventId } }).catch(() => {});
    return new NextResponse("lookup-failed", { status: 500 });
  }

  // `order_reference_id` هو `CheckoutOrder.id` الذي أرسلناه عند فتح الجلسة.
  const orderId = order.order_reference_id || body.order_reference_id;

  /**
   * نسوق الطلب إلى «مقبوض» أيّاً كان ما فُعِّل في الحساب.
   *
   * إعدادان يغيّران المسار ولا يظهر لنا أيّهما مفعَّل: بالتفويض التلقائي يمشي الطلب
   * New → Approved → Authorised وحده، وبالقبض التلقائي يقبض نداءُ التفويض في الوقت نفسه.
   * فبدل أن نسأل أيّهما مضبوط — وجوابٌ قد يتغيّر بلا إخبارنا — تُحاوَل كل خطوةٍ من الحالة
   * التي تسمح بها وحدها، ويُعامَل الرفضُ «لأن الطلب تجاوزها» على أنها تمّت.
   *
   * والترتيب هو الموثَّق: التفويض من `approved` فقط، والقبض من `authorised` فقط.
   */
  let status = order.status.toLowerCase();
  const isAlreadyDone = (err: unknown) =>
    err instanceof TamaraError && (err.status === 409 || err.code === "transition_not_allowed");

  try {
    if (status === "approved") {
      try {
        const auth = await authoriseOrder(providerOrderId);
        status = auth.status?.toLowerCase() ?? status;
        if (auth.auto_captured) status = "fully_captured";
      } catch (err) {
        if (!isAlreadyDone(err)) throw err;
        status = "authorised";
      }
    }

    if (status === "authorised") {
      try {
        await captureOrder(providerOrderId, order.total_amount, new Date());
        status = "fully_captured";
      } catch (err) {
        if (!isAlreadyDone(err)) throw err;
      }
    }
  } catch (err) {
    console.error("[webhook/tamara] authorise/capture failed", err);
    await db.paymentWebhookEvent.delete({ where: { providerEventId: eventId } }).catch(() => {});
    return new NextResponse("capture-failed", { status: 500 });
  }

  // نسأل تمارا بدل أن نثق بالحالة التي تتبّعناها محلّياً.
  const finalStatus = await getOrder(providerOrderId).then((o) => o.status).catch(() => order.status);
  const mapped = toOrderStatus(finalStatus);

  if (orderId && mapped) {
    try {
      const txn = await db.paymentTransaction.findFirst({
        where: { orderId, provider: "TAMARA" },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      const paidAt = mapped === "PAID" ? new Date() : null;
      await db.$transaction([
        db.checkoutOrder.update({
          where: { id: orderId },
          data: {
            status: mapped,
            paidAt: paidAt ?? undefined,
            failedReason: mapped === "PAID" ? null : finalStatus.slice(0, 200),
          },
        }),
        ...(txn
          ? [db.paymentTransaction.update({
              where: { id: txn.id },
              data: { status: finalStatus, rawStatus: finalStatus, settledAt: paidAt },
            })]
          : []),
      ]);
    } catch (err) {
      console.error("[webhook/tamara] order update failed", err);
    }
  }

  await db.paymentWebhookEvent.update({
    where: { providerEventId: eventId },
    data: { processedAt: new Date(), orderId: orderId ?? null },
  }).catch(() => { /* العمل تمّ؛ إخفاق الدفترة لا يُعيد تشغيله */ });

  return NextResponse.json({ ok: true, status: finalStatus });
}
