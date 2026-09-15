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
import { completeHostedSessionPayment } from "@/lib/ngenius/complete-hosted-session-payment";
import { buildMerchantOrderReference } from "@/lib/ngenius/build-merchant-order-reference";
import { primaryPayment } from "@/lib/ngenius/primary-payment";
import { isPaymentFailed } from "@/lib/ngenius/is-payment-failed";
import type { CreateOrderPayload, NGeniusOrderResponse } from "@/lib/ngenius/types";
import { buildOrderSnapshot } from "@modonty/shared/lib/payments/build-order-snapshot";
import { nextOrderNumber } from "@modonty/shared/lib/payments/next-order-number";
import { vatRateBpForMarket } from "@modonty/shared/lib/payments/vat-rate";
import { toE164 } from "@modonty/shared/lib/phone";
import { buildPlanCommitments } from "@modonty/shared/lib/commercial/build-plan-commitments";
import { getMarketCatalog } from "@modonty/shared/lib/commercial/get-market-catalog";
import { payPublicUrl } from "@/lib/pay-public-url";

/**
 * إنشاء الطلب ومحاولة الدفعة (PAY-C3 · PAY-D1).
 *
 * منقول من جبر سيو (`app/api/checkout/create-payment/route.ts`) بنفس الترتيب والحراسات،
 * وموصولٌ بجداولنا: `CheckoutOrder` بدل `Subscriber` عنده — وهو أغنى (لقطة سعرٍ كاملة
 * ورقم طلبٍ بشريّ وضريبة مفصولة)، فلا تُختصر إلى «مبلغ وخطّة».
 *
 * ⚠ السعر لا يُقرأ من الطلب أبداً. الجسم يحمل شريحة الباقة وعدد الأشهر فقط، والمبالغ
 * تُبنى هنا من الكتالوج عبر `buildOrderSnapshot`. متصفّحٌ يرسل «٥ ريال» لا يشتري بخمسة.
 *
 * ⚠ لا `export const dynamic` ولا `runtime`: مدونتي تعمل بـ`cacheComponents`، وهذان
 * يكسران البناء عندها (وقد كسراه فعلاً في مسار `log-failure` قبل أن يُحذفا).
 */

const Body = z.object({
  sessionId: z.string().min(10).max(200),
  turnstileToken: z.string().max(4096).optional().default(""),
  // الموافقة على الشروط شرطٌ لإنشاء الطلب لا تزيينٌ في الواجهة: العقد يُبرَم
  // بالدفع نفسه (بند ١١ من نموذج العقد)، فطلبٌ يصل بلا قبولٍ يُنشئ التزاماً
  // لم يوافق صاحبه على شروطه. و`literal(true)` لا `boolean`: القيمة الوحيدة المقبولة هي
  // الموافقة، فيُرّد الطلب بـ٤٠٠ قبل أن يلمس البوّابة.
  termsAccepted: z.literal(true),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  // الجوال يُطبَّع إلى E.164 لا يُقبل كما كُتب: `toE164` يرفض الأرضي والرقمين الملتصقين،
  // ويُخرج `+966…` الذي يحتاجه رابط واتساب ورسائل المزوّد. رقمٌ غير صالح يُردّ الآن لا
  // بعد الدفع حين يصير التواصل مستحيلاً.
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
  // السعودية وحدها لها بوّابة. مصر تحويلٌ بنكي يؤكّده الفريق (PAY-Q12) ولا تمرّ من هنا.
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
    return NextResponse.json(
      { error: "rate-limited", retryAfter: Math.ceil((rl.reset - Date.now()) / 1000) },
      { status: 429 },
    );
  }

  // الباقة وسعرها ومدّتها — من القاعدة، لا من الطلب.
  const plan = await db.commercialPlan.findFirst({
    where: { slug: body.planSlug, isPublished: true },
    select: {
      id: true, slug: true, name: true, tier: true, articlesPerMonth: true,
      prices: { where: { market: body.market, isActive: true }, select: { market: true, currency: true, monthlyBase: true } },
    },
  });
  const price = plan?.prices[0];
  if (!plan || !price) return NextResponse.json({ error: "plan-not-found" }, { status: 400 });

  // المدد ليست لكل سوق: `paidMonths` مفتاحٌ فريد وحده في `CommercialTermPolicy`، أي أن
  // «٦ شهور + شهر مجاناً» واحدةٌ في السعودية ومصر. فلا يُمرَّر سوقٌ هنا.
  const term = await db.commercialTermPolicy.findFirst({
    where: { paidMonths: body.paidMonths, isActive: true },
    select: { paidMonths: true, bonusServiceMonths: true },
  });
  if (!term) return NextResponse.json({ error: "term-not-found" }, { status: 400 });

  const snapshot = buildOrderSnapshot({
    plan: { id: plan.id, slug: plan.slug, name: plan.name, tier: plan.tier, articlesPerMonth: plan.articlesPerMonth },
    price: { market: price.market, currency: price.currency, monthlyBase: price.monthlyBase },
    term: { paidMonths: term.paidMonths, bonusServiceMonths: term.bonusServiceMonths },
    vatRateBp: vatRateBpForMarket(body.market),
  });
  if (snapshot.totalMinor <= 0) return NextResponse.json({ error: "invalid-total" }, { status: 400 });

  // طلبٌ جديد لكل محاولة — لا `upsert` على البريد كما عند جبر. سببه أن لقطة السعر
  // مُجمَّدة في الصفّ: لو أعاد مشترٍ المحاولة بعد تغيير السعر، فالتحديث يخلط لقطتين
  // في صفٍّ واحد ويطبع فاتورةً لا تطابق ما دفعه. ورقم الطلب يجعل المحاولات مميَّزة للفريق.

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

  const orderPayload: CreateOrderPayload = {
    action: "PURCHASE",
    amount: { currencyCode: snapshot.currency, value: snapshot.totalMinor },
    merchantOrderReference: buildMerchantOrderReference(order.id),
    merchantDefinedData: {
      orderId: order.id,
      orderNumber: order.number,
      plan: snapshot.planSlug,
      paidMonths: String(snapshot.paidMonths),
    },
    emailAddress: body.email,
    merchantAttributes: {
      /**
       * بلا بادئة `/pay` — بقيت من زمن مدونتي حيث كان المسار `modonty.com/pay/sa/...`،
       * ولمّا صار للبيمنت نطاقه صار المسار `pay.modonty.com/sa/...`. قيس حيّاً
       * (١٤ سبتمبر ٢٠٢٦): `/pay/sa/checkout/processing` ⇒ **٤٠٤** و`/sa/checkout/processing`
       * ⇒ ٢٠٠. أي أن كل مشترٍ يُنهي ٣DS كان يعود إلى صفحة غير موجودة — الدفعة تنجح عند
       * المزوّد ولا يرى هو إلا ٤٠٤، ولا يُنادى `status` فيبقى طلبه «بانتظار الدفع».
       */
      redirectUrl: `${siteUrl}/${market}/checkout/processing?order=${order.id}`,
      cancelUrl: `${siteUrl}/${market}/checkout?plan=${snapshot.planSlug}&months=${snapshot.paidMonths}&error=cancelled_by_user&order=${order.id}`,
    },
  };

  let paymentResponse: NGeniusOrderResponse;
  try {
    paymentResponse = await completeHostedSessionPayment(body.sessionId, orderPayload);
  } catch (err) {
    await db.checkoutOrder.update({
      where: { id: order.id },
      data: { status: "FAILED", failedReason: err instanceof Error ? err.message.slice(0, 200) : "unknown" },
    }).catch(() => { /* خطأٌ ثانويّ لا يُخفي الأول */ });

    await db.paymentAttempt.create({
      data: {
        orderId: order.id,
        provider: "NGENIUS",
        stage: "session",
        outcome: "error",
        reasonCode: err instanceof Error ? err.name : "ngenius-error",
        message: err instanceof Error ? err.message.slice(0, 300) : "unknown",
        planSlug: snapshot.planSlug,
        paidMonths: snapshot.paidMonths,
        market: snapshot.market,
        email: body.email,
        ip,
      },
    }).catch(() => { /* التسجيل لا يكسر المسار أبداً */ });

    return NextResponse.json(
      { error: "ngenius-failed", detail: err instanceof Error ? err.message : "unknown" },
      { status: 502 },
    );
  }

  /**
   * مرجع **الطلب** عند المزوّد — يُحفظ كي يستطيع `status` والويبهوك أن يسألا عنه مباشرةً
   * حين يتأخّر الإشعار أو يضيع.
   *
   * ⚠ `orderReference` لا `reference`: ردّ الجلسة المستضافة كائنُ **دفعة**، فـ`reference`
   * فيه مرجع الدفعة نفسها و`orderReference` هو مرجع الطلب الذي يقبله `findOrder`.
   * قيس الفرق حيّاً على الساندبوكس (١٣ سبتمبر ٢٠٢٦): بحفظ `reference` ردّ المزوّد
   * `404 invalidOrderReference`، فبقي طلبٌ **مدفوع فعلاً** عالقاً على «بانتظار الدفع»
   * ولا سبيل للحاق به — لا الاستعلام ولا الويبهوك يجد ما يسأل عنه.
   */
  const orderReference = paymentResponse?.orderReference ?? paymentResponse?.reference ?? null;
  if (orderReference) {
    await db.paymentTransaction.create({
      data: {
        orderId: order.id,
        provider: "NGENIUS",
        providerOrderRef: orderReference,
        status: primaryPayment(paymentResponse)?.state ?? "STARTED",
        amountMinor: snapshot.totalMinor,
        currency: snapshot.currency,
      },
    }).catch(() => { /* غير قاتل — الاستعلام سيجده لاحقاً بالويبهوك */ });
  }

  // رفضٌ فوري بلا تحقّق ثنائي — بطاقة أجنبية تردّها قاعدة مخاطر مثلاً.
  const declinePayment = primaryPayment(paymentResponse);
  if (isPaymentFailed(declinePayment?.state)) {
    const rc = declinePayment?.authResponse?.resultCode;
    const rm = declinePayment?.authResponse?.resultMessage;
    const reason = [rc, rm].filter(Boolean).join(" ") || declinePayment?.state || "declined";

    await db.checkoutOrder.update({
      where: { id: order.id },
      data: { status: "FAILED", failedReason: reason.slice(0, 200) },
    }).catch(() => {});

    await db.paymentAttempt.create({
      data: {
        orderId: order.id,
        provider: "NGENIUS",
        stage: "auth",
        outcome: "declined",
        reasonCode: rc ?? declinePayment?.state ?? null,
        message: rm ?? null,
        state: declinePayment?.state ?? null,
        planSlug: snapshot.planSlug,
        paidMonths: snapshot.paidMonths,
        market: snapshot.market,
        cardScheme: declinePayment?.savedCard?.scheme ?? null,
        cardBin: declinePayment?.savedCard?.maskedPan?.replace(/\D/g, "").slice(0, 6) ?? null,
        email: body.email,
        ip,
        providerRef: orderReference,
      },
    }).catch(() => {});

    // لا يُسلَّم هذا الطلب الميّت إلى `handlePaymentResponse` في المتصفّح: بلا خطوة تحقّق
    // ثنائي يبقى إطار البطاقة عالقاً على «قيد المعالجة» ولا يُحلّ وعده أبداً — وهي الحلقة
    // التي أعاد مهندس دعمٍ في N-Genius إنتاجها عند جبر. نعيد رفضاً صريحاً فيتخطّى العميل
    // الـSDK ويذهب إلى إعادة المحاولة مباشرةً.
    return NextResponse.json({ declined: true, reason: "card_declined", orderId: order.id });
  }

  return NextResponse.json({ ...paymentResponse, orderId: order.id, orderNumber: order.number });
}
