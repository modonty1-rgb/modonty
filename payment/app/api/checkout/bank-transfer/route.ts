import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { verifyTurnstileToken } from "@/lib/security/verify-turnstile-token";
import { orderLimiter } from "@/lib/security/rate-limiters";
import { buildOrderSnapshot } from "@modonty/shared/lib/payments/build-order-snapshot";
import { nextOrderNumber } from "@modonty/shared/lib/payments/next-order-number";
import { vatRateBpForMarket } from "@modonty/shared/lib/payments/vat-rate";
import { toE164 } from "@modonty/shared/lib/phone";
import { buildPlanCommitments } from "@modonty/shared/lib/commercial/build-plan-commitments";
import { getMarketCatalog } from "@modonty/shared/lib/commercial/get-market-catalog";

/**
 * تسجيل طلبٍ مصريّ بالتحويل البنكي (خالد ١٥ سبتمبر ٢٠٢٦).
 *
 * ── ليش مسارٌ منفصل عن `create-payment` ──
 * ذاك ينتهي بنداء بوّابة، وهذا ينتهي عند الصفّ. ودمجهما يعني شرطاً في منتصف مسار
 * المال يقرّر أيُنادى مزوّدٌ أم لا — وهو آخر مكانٍ يُحتمل فيه شرط. ومصر بلا بوّابة
 * اليوم (`PAY-Q12`)، فلها بابها.
 *
 * ── وليش يُنشأ الطلب **قبل** أن يرى بيانات الحساب ──
 * الترتيب المقلوب (الحساب أوّلاً) يخسر الاثنين: من يحوّل تصل حوالته بلا اسمٍ يُطابَق
 * به، ومن لا يحوّل يمضي ولا يبقى منه رقمٌ يُتابَع. فالبيانات أوّلاً، ورقم الطلب هو
 * ما يُكتب في خانة البيان — به وحده تُربط الحوالة بصاحبها.
 *
 * ── ونفس الحراسات الثلاث ──
 * تيرنستايل ثم سقف المعدّل ثم السعر من القاعدة لا من الطلب. صفحةٌ تُنشئ صفوفاً بلا
 * بوّابة دفعٍ تحتها هي أسهل هدفٍ للإغراق، لا أصعبه.
 */

const Body = z.object({
  turnstileToken: z.string().max(4096).optional().default(""),
  /**
   * الموافقة شرطُ إنشاءٍ لا تزيينُ واجهة: العقد يُبرَم بالطلب، وطلبٌ بلا قبولٍ
   * يُنشئ التزاماً لم يوافق صاحبه على شروطه. و`literal(true)` يردّه بـ٤٠٠ مبكراً.
   */
  termsAccepted: z.literal(true),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  /**
   * جوالٌ **مصريّ** لا أيّ جوال.
   *
   * `toE164` يعرف السوقين، فـ`0512345678` يُطبَّع إلى `+966…` ويمرّ — والفورم يقول
   * للمشتري «أدخل رقم موبايل مصري» بينما الخادم يقبل سعوديّاً (قيس ١٥ سبتمبر ٢٠٢٦:
   * الطلب وصل إلى حارس تيرنستايل بدل أن يُردّ ٤٠٠). وواجهةٌ تشترط ما لا يشترطه الخادم
   * ثغرةٌ في الاتجاهين: تُدخل أرقاماً لا يصلها فريقُ مصر، وتُربك من يقرأ الرسالة.
   *
   * والرقم هنا ليس تفصيلاً: عليه تُرسَل صورة الإيصال، وبه يتابع مسؤول الحساب.
   */
  phone: z.string().trim().min(6).max(20).transform((v, ctx) => {
    const { e164, reason } = toE164(v);
    if (!e164) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: reason ?? "رقم غير صالح" });
      return z.NEVER;
    }
    if (!e164.startsWith("+20")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "يرجى إدخال رقم موبايل مصري (مثال: 1XXXXXXXXX)" });
      return z.NEVER;
    }
    return e164;
  }),
  businessName: z.string().trim().max(120).optional(),
  planSlug: z.string().trim().min(1).max(60),
  paidMonths: z.coerce.number().int().min(1).max(36),
  /** مصر وحدها تمرّ من هنا — والسعودية لها بوّابة، فطلبٌ سعوديّ هنا خطأُ توجيهٍ لا حالةَ عمل. */
  market: z.literal("EG"),
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

  // الباقة وسعرها ومدّتها — من القاعدة، لا من الطلب. متصفّحٌ يرسل «٥ جنيه» لا يشتري بخمسة.
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

  const snapshot = buildOrderSnapshot({
    plan: { id: plan.id, slug: plan.slug, name: plan.name, tier: plan.tier, articlesPerMonth: plan.articlesPerMonth },
    price: { market: price.market, currency: price.currency, monthlyBase: price.monthlyBase },
    term: { paidMonths: term.paidMonths, bonusServiceMonths: term.bonusServiceMonths },
    vatRateBp: vatRateBpForMarket(body.market),
  });
  if (snapshot.totalMinor <= 0) return NextResponse.json({ error: "invalid-total" }, { status: 400 });

  /** ما وُعد به هذا المشتري، مجمَّداً في الصفّ — الفاتورة تقول ما اتُّفق عليه يومها. */
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
      country: "EG",
      planCommitments: commitments,
      /**
       * `AWAITING_TRANSFER` لا `AWAITING_PAYMENT` — وهما ليسا مترادفَين.
       *
       * الأولى حالة مصر في المخطّط («Egypt — buyer transfers by hand, staff confirms»)،
       * والثانية حالة السعودية بعد فتح جلسة البوّابة. والفرق ليس تسميةً: الأدمن يعرض
       * نموذج «أكّد وصول الحوالة» على `AWAITING_TRANSFER` وحدها
       * (`orders/[id]/page.tsx:94`)، و`confirmOrderPaymentAction` يشترطها في `updateMany`
       * — فبالحالة الخطأ لا يظهر الزرّ أصلاً، ولو نودي الـaction لردّ «ليس بانتظار تحويل».
       *
       * أي أن طلباً مصريّاً بـ`AWAITING_PAYMENT` يعلق للأبد: المال يصل ولا سبيل لتسجيله.
       * قيس ١٥ سبتمبر ٢٠٢٦ على `ORD-2026-00058`.
       */
      status: "AWAITING_TRANSFER",
    },
    select: { id: true, number: true },
  });

  return NextResponse.json({ orderId: order.id, orderNumber: order.number });
}
