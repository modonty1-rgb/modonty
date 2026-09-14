import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { findNGeniusOrder } from "@/lib/ngenius/find-ngenius-order";
import { primaryPayment } from "@/lib/ngenius/primary-payment";
import { isPaymentSucceeded } from "@/lib/ngenius/is-payment-succeeded";
import { isPaymentFailed } from "@/lib/ngenius/is-payment-failed";
import { assertAmountMatchesOrder } from "@/lib/ngenius/assert-amount-matches-order";

/**
 * مستقبِل ويبهوك N-Genius (PAY-D3) — منقول من جبر سيو `app/api/webhooks/n-genius/route.ts`.
 *
 * ── نموذج الأمان (بحسب توثيقهم: هم **لا** يوقّعون الويبهوك بـHMAC) ──
 * ١ خطّ الدفاع الأول: مطابقةٌ تامّة لترويسة سرٍّ مشترك نضبطها في بوّابتهم وفي بيئتنا.
 *   تسريبها يعني تدويرها، لا أكثر.
 * ٢ خطّ الدفاع الثاني — وهو الأهمّ: **لا نصدّق جسم الويبهوك أبداً**. نتّصل بهم ونسأل عن
 *   الحالة الحقيقية قبل أن نلمس صفّ الطلب. فلو قال الويبهوك «قُبض» وقالت واجهتهم «ما زال
 *   معلَّقاً»، أُهمل الويبهوك. بلا هذا، من يعرف رقم طلبٍ يستطيع أن يجعله مدفوعاً.
 *
 * ── عدم التكرار ──
 * `PaymentWebhookEvent.providerEventId` فريد. فلو أُطلق الحدث نفسه مرّتين — منهم أو من
 * عابث — عولج مرّةً واحدة. ويُسجَّل الحدث **قبل** أي تغيير حالة كي تنسحب الإعادة مبكراً.
 *
 * لا `export const dynamic` ولا `runtime`: يكسران البناء تحت `cacheComponents`.
 */

const HEADER_NAME = "x-ngenius-webhook-secret";

type NGeniusWebhookBody = {
  event?: string;
  order?: { reference?: string; id?: string };
  transaction?: { id?: string; state?: string; date?: string };
  timestamp?: string;
  merchantOrderReference?: string;
};

/** معرّفٌ ثابتٌ للحدث من حقولٍ يرسلها المزوّد دائماً — أساس منع التكرار. */
function buildEventId(body: NGeniusWebhookBody): string {
  return [
    body.event ?? "unknown",
    body.transaction?.id ?? body.order?.id ?? "no-txn",
    body.timestamp ?? body.transaction?.date ?? "no-ts",
  ].join("::");
}

export async function POST(req: Request) {
  const secret = process.env.NGENIUS_WEBHOOK_SECRET ?? "";
  const provided = req.headers.get(HEADER_NAME);
  if (!secret || provided !== secret) return new NextResponse("unauthorized", { status: 401 });

  let body: NGeniusWebhookBody;
  try {
    body = JSON.parse(await req.text()) as NGeniusWebhookBody;
  } catch {
    return new NextResponse("invalid-json", { status: 400 });
  }

  const eventId = buildEventId(body);
  const orderRef = body.order?.reference;
  if (!orderRef) return new NextResponse("missing-order-reference", { status: 400 });

  const existing = await db.paymentWebhookEvent.findUnique({ where: { providerEventId: eventId } });
  if (existing?.processedAt) return new NextResponse("already-processed", { status: 200 });

  // `merchantOrderReference` هو `CheckoutOrder.id` كما أرسلناه عند الإنشاء.
  const orderId = body.merchantOrderReference?.trim() || null;
  const order = orderId
    ? await db.checkoutOrder.findUnique({
        where: { id: orderId },
        select: { id: true, status: true, planSlug: true, paidMonths: true, market: true, buyerEmail: true, totalMinor: true, currency: true },
      }).catch(() => null)
    : null;

  await db.paymentWebhookEvent.upsert({
    where: { providerEventId: eventId },
    create: {
      provider: "NGENIUS",
      providerEventId: eventId,
      orderId: order?.id ?? null,
      eventType: body.event ?? "unknown",
      payload: body as unknown as object,
    },
    update: {},
  });

  // تحقّقٌ ثانٍ — الحقيقة من عندهم لا من الجسم.
  let trueState: string | undefined;
  let failCode: string | undefined;
  let failMessage: string | undefined;
  let failReason: string | undefined;
  let cardScheme: string | undefined;
  let cardBin: string | undefined;
  let providerReference: string | undefined;
  let verifiedOrder: Awaited<ReturnType<typeof findNGeniusOrder>> | null = null;
  try {
    const trueOrder = await findNGeniusOrder(orderRef);
    verifiedOrder = trueOrder;
    const payment = primaryPayment(trueOrder);
    trueState = payment?.state;
    providerReference = payment?.reference;
    cardScheme = payment?.savedCard?.scheme;
    cardBin = payment?.savedCard?.maskedPan?.replace(/\D/g, "").slice(0, 6);
    if (isPaymentFailed(trueState)) {
      failCode = payment?.authResponse?.resultCode;
      failMessage = payment?.authResponse?.resultMessage;
      failReason = [failCode, failMessage].filter(Boolean).join(" ") || trueState || "unknown";
    }
  } catch (e) {
    // تعذّر التحقّق ⇒ لا نغيّر شيئاً. 503 تجعلهم يعيدون الإرسال، ومسار الاستعلام من شاشة
    // الانتظار يلحق الحالة متى عادت واجهتهم. الصمت هنا أأمن من تخمينٍ يمسّ مالاً.
    console.error("[webhook/n-genius] findOrder failed:", e);
    await db.paymentWebhookEvent.update({
      where: { providerEventId: eventId },
      data: { error: e instanceof Error ? e.message.slice(0, 300) : "verify-failed" },
    }).catch(() => {});
    return new NextResponse("verify-failed", { status: 503 });
  }

  if (order) {
    try {
      const txn = await db.paymentTransaction.findFirst({
        where: { orderId: order.id, provider: "NGENIUS" },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });

      if (isPaymentSucceeded(trueState)) {
        // 🔴 نفس حارس المبلغ الذي في الاستعلام — المساران يقلبان الطلب إلى «مدفوع»،
        // فلا يُحرس أحدهما ويُترك الآخر.
        const verdict = verifiedOrder
          ? assertAmountMatchesOrder(verifiedOrder, order)
          : { ok: false, reason: "no_verified_order" as string | null };
        if (!verdict.ok) {
          await db.paymentAttempt.create({
            data: {
              orderId: order.id, provider: "NGENIUS", stage: "webhook", outcome: "error",
              reasonCode: "amount_guard", message: verdict.reason?.slice(0, 500) ?? null,
              state: trueState ?? null, planSlug: order.planSlug, paidMonths: order.paidMonths,
              market: order.market, email: order.buyerEmail, providerRef: orderRef,
            },
          }).catch(() => {});
          await db.paymentWebhookEvent.update({
            where: { providerEventId: eventId },
            data: { error: (verdict.reason ?? "amount_guard").slice(0, 300) },
          }).catch(() => {});
          // 200 كي لا يعيد المزوّد الإرسال بلا نهاية — الحدث وصل وسُجِّل، والقرار لإنسان.
          return new NextResponse("amount-mismatch-held", { status: 200 });
        }

        const paidAt = new Date();
        await db.$transaction([
          db.checkoutOrder.update({ where: { id: order.id }, data: { status: "PAID", paidAt, failedReason: null } }),
          ...(txn
            ? [db.paymentTransaction.update({
                where: { id: txn.id },
                data: { status: trueState!, rawStatus: trueState, providerReference: providerReference ?? null, settledAt: paidAt },
              })]
            : []),
        ]);
      } else if (isPaymentFailed(trueState)) {
        await db.$transaction([
          db.checkoutOrder.update({
            where: { id: order.id },
            data: { status: "FAILED", failedReason: (failReason ?? "unknown").slice(0, 200) },
          }),
          ...(txn ? [db.paymentTransaction.update({ where: { id: txn.id }, data: { status: trueState!, rawStatus: trueState } })] : []),
        ]);
        await db.paymentAttempt.create({
          data: {
            orderId: order.id,
            provider: "NGENIUS",
            stage: "webhook",
            outcome: "declined",
            reasonCode: (failCode ?? trueState ?? null)?.slice(0, 80) ?? null,
            message: failMessage?.slice(0, 500) ?? null,
            state: trueState ?? null,
            planSlug: order.planSlug,
            paidMonths: order.paidMonths,
            market: order.market,
            cardScheme: cardScheme ?? null,
            cardBin: cardBin ?? null,
            email: order.buyerEmail,
            providerRef: orderRef,
          },
        }).catch(() => { /* التسجيل لا يكسر المعالجة */ });
      }
      // أي حالة أخرى (STARTED · تفويضٌ بانتظار القبض) تُترك كما هي — ليست نتيجةً بعد.
    } catch (e) {
      console.error("[webhook/n-genius] order update failed:", e);
    }
  }

  await db.paymentWebhookEvent.update({
    where: { providerEventId: eventId },
    data: { processedAt: new Date() },
  });

  return new NextResponse("ok", { status: 200 });
}
