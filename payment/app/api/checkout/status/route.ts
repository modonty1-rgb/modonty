import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { findNGeniusOrder } from "@/lib/ngenius/find-ngenius-order";
import { primaryPayment } from "@/lib/ngenius/primary-payment";
import { isPaymentSucceeded } from "@/lib/ngenius/is-payment-succeeded";
import { isPaymentFailed } from "@/lib/ngenius/is-payment-failed";
import { assertAmountMatchesOrder } from "@/lib/ngenius/assert-amount-matches-order";
import { statusLimiter } from "@/lib/security/rate-limiters";

/**
 * حالة طلبٍ واحد — يُنادى بالتكرار من شاشة الانتظار (منقول من جبر سيو
 * `app/api/checkout/status/route.ts`).
 *
 * مصدران للحقيقة:
 *   ١ صفّ الطلب عندنا — يقلبه الويبهوك إلى PAID/FAILED. رخيصٌ وحاسمٌ متى وصل.
 *   ٢ واجهة المزوّد — الحالة القاطعة، محدَّثةٌ دائماً.
 *
 * فإن وصل الويبهوك فالأول يكفي. وإن تأخّر أو ضاع — أو كنّا على الساندبوكس بلا نفقٍ يستقبله —
 * نسأل المزوّد بالمرجع المحفوظ ونوفّق. هذا هو «الاستعلام الاحتياطي»: يستردّ ويبهوكاً
 * ضائعاً بلا أن يفعل المشتري شيئاً. وبدونه يبقى مَن دفع فعلاً على دوّارةٍ أبدية.
 *
 * لا يُعيد هذا المسار سبب الفشل الخام للمتصفّح — يكفي «فشل» وسببٌ مصاغٌ للقراءة؛ ورمز
 * البنك التفصيلي يسكن `PaymentAttempt` للفريق.
 */

function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? "127.0.0.1"
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("order")?.trim();
  if (!orderId) return NextResponse.json({ error: "missing_order" }, { status: 400 });

  const rl = await statusLimiter.limit(getIp(request));
  if (!rl.success) return NextResponse.json({ error: "rate-limited" }, { status: 429 });

  const order = await db.checkoutOrder.findUnique({
    where: { id: orderId },
    select: {
      id: true, number: true, status: true, failedReason: true, paidAt: true,
      planSlug: true, paidMonths: true, market: true, buyerEmail: true,
      totalMinor: true, currency: true,
      transactions: {
        where: { provider: "NGENIUS" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, providerOrderRef: true },
      },
    },
  }).catch(() => null);

  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // حُسم أمره — تُعاد حقيقة القاعدة كما هي بلا نداءٍ خارجي.
  if (order.status !== "AWAITING_PAYMENT") {
    return NextResponse.json({
      order: order.id,
      number: order.number,
      status: order.status,
      failReason: order.failedReason ?? null,
      paidAt: order.paidAt?.toISOString() ?? null,
    });
  }

  const debug = url.searchParams.get("debug") === "1";
  const txn = order.transactions[0] ?? null;
  let pollErr: string | null = null;
  let pollState: string | null = null;

  if (txn?.providerOrderRef) {
    try {
      const trueOrder = await findNGeniusOrder(txn.providerOrderRef);
      const payment = primaryPayment(trueOrder);
      const state = payment?.state;
      pollState = state ?? "no-state";

      if (isPaymentSucceeded(state)) {
        // 🔴 حارس المبلغ: النجاح وحده لا يكفي — لا بدّ أن يكون المرصود **مبلغ هذا الطلب**.
        // بدونه يُوسم طلبٌ مدفوعاً لأن دفعةً ما نجحت، أيّاً كان مقدارها.
        const verdict = assertAmountMatchesOrder(trueOrder, order);
        if (!verdict.ok) {
          await db.paymentAttempt.create({
            data: {
              orderId: order.id, provider: "NGENIUS", stage: "poll", outcome: "error",
              reasonCode: "amount_guard", message: verdict.reason?.slice(0, 500) ?? null,
              state: state ?? null, planSlug: order.planSlug, paidMonths: order.paidMonths,
              market: order.market, email: order.buyerEmail, providerRef: txn.providerOrderRef,
            },
          }).catch(() => {});
          // يبقى الطلب كما هو — لا مدفوعاً ولا فاشلاً. إنسانٌ يقرّر.
          return NextResponse.json({ order: order.id, number: order.number, status: "AWAITING_PAYMENT", failReason: null, paidAt: null, needsReview: true });
        }

        const paidAt = new Date();
        await db.$transaction([
          db.checkoutOrder.update({ where: { id: order.id }, data: { status: "PAID", paidAt, failedReason: null } }),
          db.paymentTransaction.update({
            where: { id: txn.id },
            data: { status: state!, rawStatus: state, providerReference: payment?.reference ?? null, settledAt: paidAt },
          }),
        ]);
        return NextResponse.json({ order: order.id, number: order.number, status: "PAID", failReason: null, paidAt: paidAt.toISOString() });
      }

      if (isPaymentFailed(state)) {
        const rc = payment?.authResponse?.resultCode;
        const rm = payment?.authResponse?.resultMessage;
        const failReason = [rc, rm].filter(Boolean).join(" ") || state || "unknown";
        await db.$transaction([
          db.checkoutOrder.update({ where: { id: order.id }, data: { status: "FAILED", failedReason: failReason.slice(0, 200) } }),
          db.paymentTransaction.update({ where: { id: txn.id }, data: { status: state!, rawStatus: state } }),
        ]);
        // السبب الحقيقي يُكتب هنا: المتصفّح لا يعرفه، والسيرفر يعرفه.
        await db.paymentAttempt.create({
          data: {
            orderId: order.id,
            provider: "NGENIUS",
            stage: "poll",
            outcome: "declined",
            reasonCode: (rc ?? state ?? null)?.slice(0, 80) ?? null,
            message: rm?.slice(0, 500) ?? null,
            state: state ?? null,
            planSlug: order.planSlug,
            paidMonths: order.paidMonths,
            market: order.market,
            cardScheme: payment?.savedCard?.scheme ?? null,
            cardBin: payment?.savedCard?.maskedPan?.replace(/\D/g, "").slice(0, 6) ?? null,
            email: order.buyerEmail,
            providerRef: txn.providerOrderRef,
          },
        }).catch(() => { /* التسجيل لا يكسر الاستعلام */ });
        return NextResponse.json({ order: order.id, number: order.number, status: "FAILED", failReason, paidAt: null });
      }
      // غير ذلك ما زال جارياً (STARTED أو تفويضٌ بانتظار القبض) — يُكمَل إلى الردّ المعلَّق.
    } catch (err) {
      pollErr = err instanceof Error ? err.message : String(err);
      console.error("[checkout/status] N-Genius poll failed:", pollErr);
    }
  }

  return NextResponse.json({
    order: order.id,
    number: order.number,
    status: "AWAITING_PAYMENT",
    failReason: null,
    paidAt: null,
    ...(debug ? { _debug: { pollErr, pollState, providerOrderRef: txn?.providerOrderRef ?? null } } : {}),
  });
}
