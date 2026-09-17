import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * المنطقة: البوّابة في الرياض، والافتراضي في Vercel `iad1` (فرجينيا). قيس حيّاً
 * (١٤ سبتمبر ٢٠٢٦ على pay.modonty.com): نداءا التوكن والاستعلام من iad1 تجاوزا مهلة
 * الستّ ثوانٍ — `AbortError: This operation was aborted` — فبقي طلبٌ مدفوعٌ فعلاً على
 * «بانتظار الدفع». و`fra1` أقرب منطقة متاحة إلى الخليج، فتقصر المسافة إلى النصف.
 */
export const preferredRegion = "fra1";

import { db } from "@/lib/db";
import { verifyTurnstileToken } from "@/lib/security/verify-turnstile-token";
import { orderLimiter } from "@/lib/security/rate-limiters";
import { TamaraError, tamaraIsConfigured } from "@/lib/tamara/client";
import { createCheckoutSession, digitalShippingAddress, isCustomerEligible, splitName } from "@/lib/tamara/checkout";
import { buildOrderSnapshot } from "@modonty/shared/lib/payments/build-order-snapshot";
import { nextOrderNumber } from "@modonty/shared/lib/payments/next-order-number";
import { vatRateBpForMarket } from "@modonty/shared/lib/payments/vat-rate";
import { toE164 } from "@modonty/shared/lib/phone";
import { buildPlanCommitments } from "@modonty/shared/lib/commercial/build-plan-commitments";
import { getMarketCatalog } from "@modonty/shared/lib/commercial/get-market-catalog";
import { payPublicUrl } from "@/lib/pay-public-url";

/**
 * نصف الشراء الآخر — نفس الطلب مدفوعاً بالتقسيط بدل البطاقة (منقول من جبر سيو
 * `app/api/checkout/tamara/route.ts`).
 *
 * كل حارسٍ يمرّ به مسار البطاقة يمرّ به هذا وبالترتيب نفسه: لا يُفلت مشترٍ من Turnstile أو
 * حدّ المعدّل باختياره الزرّ الآخر. والذي لا يُشارَك عمداً هو السعر — يُقرأ من القاعدة هنا
 * أيضاً، فلا يستطيع أيّ مسارٍ أن يُقنَع بإجماليٍّ من متصفّحه.
 *
 * والسوق ثابتٌ على السعودية لأن هذا ما يُفعَّل له الحساب: تمارا تردّ مصر بـ
 * `400 not_supported_delivery_country`، وزرٌّ يفشل دائماً أسوأ من زرٍّ غائب.
 */

const Body = z.object({
  turnstileToken: z.string().max(4096).optional().default(""),
  // نفس حارس `create-payment`: النموذج يتحقّق من الموافقة ولا يرسلها، فطلبٌ مباشر
  // ينشئ تقسيطاً بلا قبول شروطه.
  termsAccepted: z.literal(true),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(6).max(20).transform((v, ctx) => {
    const { e164, reason } = toE164(v);
    if (!e164) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: reason ?? "رقم غير صالح" });
      return z.NEVER;
    }
    return e164;
  }),
  businessName: z.string().trim().max(120).optional(),
  planSlug: z.string().trim().min(1).max(60),
  paidMonths: z.coerce.number().int().min(1).max(36),
  market: z.literal("SA"),
});

function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? "127.0.0.1"
  );
}

export async function POST(req: Request) {
  if (!tamaraIsConfigured()) {
    return NextResponse.json({ error: "tamara-not-configured" }, { status: 503 });
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const ip = getIp(req);

  const turn = await verifyTurnstileToken(body.turnstileToken, ip);
  if (!turn.success) {
    return NextResponse.json({ error: "bot-check-failed", codes: turn.errorCodes }, { status: 403 });
  }

  const rl = await orderLimiter.limit(ip);
  if (!rl.success) {
    return NextResponse.json({ error: "rate-limited", retryAfter: Math.ceil((rl.reset - Date.now()) / 1000) }, { status: 429 });
  }

  const plan = await db.commercialPlan.findFirst({
    where: { slug: body.planSlug, isPublished: true },
    select: {
      id: true, slug: true, name: true, tier: true, articlesPerMonth: true,
      prices: { where: { market: body.market, isActive: true }, select: { market: true, currency: true, monthlyBase: true } },
    },
  });
  const price = plan?.prices[0];
  if (!plan || !price) return NextResponse.json({ error: "plan-not-found" }, { status: 400 });

  const term = await db.commercialTermPolicy.findFirst({
    where: { paidMonths: body.paidMonths, isActive: true },
    select: { paidMonths: true, bonusServiceMonths: true },
  });
  if (!term) return NextResponse.json({ error: "term-not-found" }, { status: 400 });

  // نفس قاعدة مسار البطاقة: الأساس الشهري × المدّة، يُدفع مرّة. ثم تقسّم تمارا **ذلك
  // الإجمالي** على جدولها الخاص — الجدولان لا علاقة بينهما، وأشهر الخدمة المجانية تبقى
  // هديّة تنفيذٍ لا خصماً على المبلغ.
  const snapshot = buildOrderSnapshot({
    plan: { id: plan.id, slug: plan.slug, name: plan.name, articlesPerMonth: plan.articlesPerMonth },
    price: { market: price.market, currency: price.currency, monthlyBase: price.monthlyBase },
    term: { paidMonths: term.paidMonths, bonusServiceMonths: term.bonusServiceMonths },
    vatRateBp: vatRateBpForMarket(body.market),
  });
  if (snapshot.totalMinor <= 0) return NextResponse.json({ error: "invalid-total" }, { status: 400 });

  // تمارا تتعامل بالوحدة الكبرى (ريالات) لا بالهللات — عكس N-Genius تماماً.
  const totalMajor = snapshot.totalMinor / 100;

  // يُسأل هنا — قبل الطلب وقبل وجود أي صفّ — لأن مشترياً سترفضه تمارا يجب ألّا يُرسَل إليها
  // أصلاً. ويفشل مفتوحاً: أي انقطاعٍ أو خطأٍ يُجيب «مؤهَّل»، بحسب إرشادها هي.
  const eligible = await isCustomerEligible({
    amount: totalMajor,
    currency: snapshot.currency,
    email: body.email,
    phoneNumber: body.phone,
  });
  if (!eligible) return NextResponse.json({ error: "tamara-not-eligible" }, { status: 409 });


  /**
   * ما وُعد به هذا المشتري، مجمَّداً في الصفّ (PAY-E5). يُقرأ من الكتالوج المنشور نفسه —
   * لا من قائمةٍ ثانية — كي يطابق ما رآه على البطاقة قبل ثوانٍ. وإن أخفق القارئ لأي سبب
   * فالطلب يمضي بلا التزامات مكتوبة: منعُ بيعةٍ لأن سطراً وصفيّاً تعذّر قراءته خسارةٌ
   * أكبر من غيابه.
   */
  const commitments = await getMarketCatalog(db, body.market)
    .then((c) => {
      const p = c.plans.find((x) => x.slug === snapshot.planSlug);
      return p ? buildPlanCommitments(p.features, snapshot.paidMonths + snapshot.bonusServiceMonths) : [];
    })
    .catch(() => [] as string[]);

  const order = await db.checkoutOrder.create({
    data: {
      number: await nextOrderNumber(db),
      ...snapshot,
      buyerName: body.name,
      buyerEmail: body.email,
      buyerPhone: body.phone,
      businessName: body.businessName || null,
      planCommitments: commitments,
      status: "AWAITING_PAYMENT",
    },
    select: { id: true, number: true },
  });

  const siteUrl = payPublicUrl();
  const market = body.market.toLowerCase();
  const { first, last } = splitName(body.name);
  const money = { amount: totalMajor, currency: snapshot.currency };
  const serviceMonths = snapshot.paidMonths + snapshot.bonusServiceMonths;

  try {
    const session = await createCheckoutSession({
      order_reference_id: order.id,
      total_amount: money,
      description: `${snapshot.planName} — ${serviceMonths} شهور`.slice(0, 256),
      country_code: body.market,
      payment_type: "PAY_BY_INSTALMENTS",
      locale: "ar_SA",
      items: [
        {
          reference_id: snapshot.planSlug,
          type: "Digital",
          name: snapshot.planName,
          sku: `${snapshot.planSlug}-${snapshot.paidMonths}m`,
          quantity: 1,
          total_amount: money,
        },
      ],
      consumer: { first_name: first, last_name: last, phone_number: body.phone, email: body.email },
      shipping_address: digitalShippingAddress(first, last, body.market, body.phone),
      // صفرٌ في خانة الضريبة لا لأنها معدومة، بل لأن سعر الكتالوج **شامل** لها
      // (PAY-Q7): إعلانها هنا يجعل تمارا تضيفها فوق الإجمالي فيدفع المشتري مرّتين.
      tax_amount: { amount: 0, currency: snapshot.currency },
      shipping_amount: { amount: 0, currency: snapshot.currency },
      merchant_url: {
        /* بلا `/pay` — نفس علّة N-Genius: البادئة من زمن `modonty.com/pay/…` وقد صار
           للبيمنت نطاقه. قيس حيّاً: `/pay/sa/checkout/processing` ⇒ ٤٠٤. */
        success: `${siteUrl}/${market}/checkout/processing?order=${order.id}&via=tamara`,
        failure: `${siteUrl}/${market}/checkout/failed?order=${order.id}&via=tamara`,
        cancel: `${siteUrl}/${market}/checkout?plan=${snapshot.planSlug}&months=${snapshot.paidMonths}&error=cancelled_by_user&order=${order.id}`,
        notification: `${siteUrl}/api/webhooks/tamara`,
      },
    });

    // معرّف تمارا هو ما يُفتَّش به لاحقاً وما يحمله الويبهوك، فيُخزَّن حيث يُخزَّن مرجع
    // البطاقة تماماً — عمودٌ واحد بمعنى واحد.
    await db.paymentTransaction.create({
      data: {
        orderId: order.id,
        provider: "TAMARA",
        providerOrderRef: session.order_id,
        status: session.status || "NEW",
        amountMinor: snapshot.totalMinor,
        currency: snapshot.currency,
      },
    }).catch(() => { /* غير قاتل — الويبهوك يحمل المرجع أيضاً */ });

    return NextResponse.json({ checkoutUrl: session.checkout_url, providerOrderId: session.order_id, orderId: order.id });
  } catch (err) {
    const isTamara = err instanceof TamaraError;
    const code = isTamara ? err.code ?? `http-${err.status}` : "tamara-error";
    const message = err instanceof Error ? err.message.slice(0, 300) : "unknown";

    await db.checkoutOrder.update({
      where: { id: order.id },
      data: { status: "FAILED", failedReason: message.slice(0, 200) },
    }).catch(() => { /* خطأٌ ثانويّ */ });

    await db.paymentAttempt.create({
      data: {
        orderId: order.id,
        provider: "TAMARA",
        stage: "session",
        outcome: "error",
        reasonCode: code.slice(0, 80),
        message,
        planSlug: snapshot.planSlug,
        paidMonths: snapshot.paidMonths,
        market: snapshot.market,
        email: body.email,
        ip,
      },
    }).catch(() => { /* التسجيل لا يكسر المسار */ });

    // لا يرى المشتري صياغة تمارا أبداً — هي مكتوبة لمطوّر.
    return NextResponse.json({ error: "tamara-failed", code }, { status: 502 });
  }
}
