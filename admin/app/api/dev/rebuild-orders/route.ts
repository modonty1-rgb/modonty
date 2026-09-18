import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { nextOrderNumber } from "@modonty/shared/lib/payments/next-order-number";

/**
 * إعادةُ بناء الطلبات — إخلاءٌ ثمّ ترحيل، في عمليّةٍ واحدة.
 *
 * العملاءُ القدامى وُلدوا قبل أن يوجد نظامُ الطلبات، فباقتُهم ومبلغُهم متفرّقان على
 * حقولٍ في كرت العميل وجدولٍ قديم. وكلُّ ما بُني في هذا الريفاكتور يقرأ من **الطلب**:
 * اسمُ الباقة · الحصّة · المبلغ · المدّة. فبلا طلبٍ لكلّ عميل يبقى الجدولُ القديم حيّاً.
 *
 * وخطوتان في زرٍّ واحد بقرار خالد (١٧ سبتمبر ٢٠٢٦): «لو فيه أيّ مشكلة مستقبليّة، خلاص
 * قدّامنا زرٌّ واحد يسوّي الكلام هذا كلّه». فأيُّ خللٍ في النتيجة يُعالَج بإعادة الضغط،
 * لا بترقيعِ صفوفٍ بعينها.
 *
 * **لا يُعدَّل عميلٌ ولا يُحذف.** يُنشأ الطلب، ويُضبط `Client.activeOrderId` ليشير إليه —
 * وهو الحقلُ الذي تقرأ منه بطاقةُ الاشتراك.
 *
 * وما لا يُعرف لا يُخمَّن: يُكتب الطلبُ على كلّ حال، ويُوسَم في `notes` بما ينقصه،
 * ويُرجَع في جدول «يحتاج مراجعة» ليُصحَّح يدويّاً (قرار خالد: «يحتاج مراجعة وأنا أراجع يدوي»).
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

/** نهايةُ الاشتراك = يومُ التفعيل + الشهور — نفسُ صيغة `recompute-subscription-end.ts`. */
function addMonthsTo(from: Date, months: number): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  return d;
}

function refuseIfNotDev(): Response | null {
  const url = process.env.DATABASE_URL;
  if (!url) return Response.json({ error: "DATABASE_URL is not set" }, { status: 500 });
  if (!url.includes("modonty_dev")) {
    const dbName = url.match(/\/(\w+)\?/)?.[1] || "unknown";
    return Response.json(
      { error: `Refusing — DATABASE_URL must point to modonty_dev (current: ${dbName})` },
      { status: 400 },
    );
  }
  return null;
}

/**
 * بلدُ العميل نصٌّ حرّ: بعضُه `EG`/`SA` وبعضُه «المملكة العربية السعودية».
 * نفسُ القاعدة المستعملة في تقرير المبيعات (`get-sales-report.ts:86`) — مصدرٌ واحد
 * لقراءة العملة، فلا يفترق رقمُ الترحيل عن رقم التقرير.
 */
function marketForCountry(country: string | null): { market: "SA" | "EG"; currency: "SAR" | "EGP" } | null {
  const c = (country ?? "").trim().toLowerCase();
  if (!c) return null;
  if (/مصر|egypt|\beg\b/.test(c)) return { market: "EG", currency: "EGP" };
  if (/سعود|saudi|\bksa\b|\bsa\b/.test(c)) return { market: "SA", currency: "SAR" };
  return null;
}

/** دورةُ الفوترة → شهورٌ مدفوعة. `annual` سنةٌ كاملة، `monthly` شهرٌ واحد. */
function monthsForCycle(cycle: string | null): number | null {
  if (cycle === "annual") return 12;
  if (cycle === "monthly") return 1;
  return null;
}

interface PlannedOrder {
  clientId: string;
  clientName: string;
  /** مندوبُ الصفقة — من كرت العميل، وفارغاً يُوسم نقصاً لا يُخمَّن. */
  salesRepId: string | null;
  planName: string | null;
  planSlug: string | null;
  planId: string | null;
  articlesPerMonth: number | null;
  market: "SA" | "EG" | null;
  currency: "SAR" | "EGP" | null;
  totalMinor: number;
  paidMonths: number;
  serviceStartedAt: Date | null;
  /**
   * يومُ التفعيل للمُرحَّل = يومُ إنشاء كرت العميل (خالد ١٨ سبتمبر ٢٠٢٦).
   * القديمُ لم يسجّل تفعيلاً قطّ (`Client.activatedAt` صفر من ٤٢)، وإنشاءُ الكرت هو
   * أقربُ حدثٍ موثَّق لدخول العميل الخدمة.
   */
  activatedAt: Date;
  /** المدّةُ كما يقولها كلُّ مصدر — تُعرَض معاً لأنّها تتناقض. */
  monthsByCycle: number | null;
  monthsByAmount: number | null;
  monthsByDates: number | null;
  /** ما ينقص هذا الصفّ أو يتناقض فيه — فارغةٌ تعني طلباً كاملاً. */
  gaps: string[];
}

/**
 * يحسب ما سيُكتب لكلّ عميل — بلا أيّ كتابة.
 *
 * نفسُ الدالّة تخدم الوضع الجافّ والتنفيذ، فما يُعرَض قبل الضغط هو ما يُكتب بعده
 * حرفاً بحرف. عرضٌ يُحسب بطريقٍ وكتابةٌ بطريقٍ آخر هو كيف يكذب جدولُ المعاينة.
 */
async function planAll(): Promise<PlannedOrder[]> {
  const [clients, plans, prices] = await Promise.all([
    db.client.findMany({
      select: {
        id: true, name: true, email: true, phone: true, addressCountry: true,
        articlesPerMonth: true, openingBalance: true, billingCycle: true,
        subscriptionStartDate: true, subscriptionEndDate: true, createdAt: true,
        // المندوبُ يُرحَّل مع الصفقة (خالد ١٨ سبتمبر ٢٠٢٦: «نقطة مهمّة جدّاً أنت ناسيها —
        // المندوب»). كان يسقط، فتخرج ٤٢ صفقةً بلا صاحبٍ يُنسب إليه البيع، وتقريرُ
        // عمولات المندوبين يقرأ الطلبَ لا الكرت.
        salesRepId: true,
        subscriptionTierConfig: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.commercialPlan.findMany({ select: { id: true, slug: true, name: true } }),
    // السعرُ الشهريّ المعلَن لكلّ باقةٍ في سوقها — به يُقاس ادّعاءُ `billingCycle`.
    db.commercialPlanPrice.findMany({
      where: { isActive: true },
      select: { market: true, monthlyBase: true, planId: true },
    }),
  ]);

  return clients.map((c) => {
    const gaps: string[] = [];

    // الرابط: اسمُ باقة الجدول القديم ↔ اسمُ باقة الكتالوج.
    //
    // قيس الرابطان الممكنان معاً (الاسم، والفئة في بيانات `commercial_plans`) فاتّفقا
    // في ٤٠ من ٤٢ واختلفا في صفر. والاسمُ هو الباقي في السكيما بعد سقوط `tier`، فهو
    // المعتمَد. والاثنان اللذان لا مقابلَ لهما باقتُهما «مجاني» — لا صفَّ لها في
    // الكتالوج أصلاً، فتُوسَم ولا تُخمَّن.
    const tierName = c.subscriptionTierConfig?.name ?? null;
    const plan = tierName ? plans.find((p) => p.name === tierName) ?? null : null;
    if (!tierName) gaps.push("بلا باقة في الجدول القديم");
    else if (!plan) gaps.push(`باقة «${tierName}» بلا صفٍّ في الكتالوج`);

    if (c.articlesPerMonth == null) gaps.push("بلا حصّةٍ شهريّة");

    const mc = marketForCountry(c.addressCountry);
    if (!mc) gaps.push(c.addressCountry ? `بلدٌ غير مفهوم: «${c.addressCountry}»` : "بلا بلد — العملة مجهولة");

    const totalMinor = c.openingBalance ? Math.round(c.openingBalance * 100) : 0;
    if (!c.openingBalance) gaps.push("بلا رصيدٍ افتتاحيّ — المبلغ صفر");

    const months = monthsForCycle(c.billingCycle);
    if (months == null) gaps.push(c.billingCycle ? `دورةُ فوترةٍ غير مفهومة: «${c.billingCycle}»` : "بلا دورةِ فوترة");

    if (!c.subscriptionStartDate) gaps.push("بلا تاريخ بداية");

    // مندوبٌ غائبٌ يُوسم ولا يُخمَّن: نسبةُ بيعٍ لغير صاحبها أسوأ من خانةٍ فارغة.
    if (!c.salesRepId) gaps.push("بلا مندوب");

    /**
     * ── المدّة: ثلاثةُ مصادرَ تتناقض، ولا واحدَ منها يُصدَّق وحده ──
     *
     * `billingCycle` حقلٌ معلَن، لكنّه قيس على بيانات الإنتاج فخالف المبلغَ في
     * **٢٣ من ٢٨**: عميلٌ مكتوبٌ عليه `annual` ورصيدُه يساوي ثلاثةَ أشهر بسعر باقته،
     * وآخرُ مكتوبٌ عليه `monthly` ورصيدُه ستّةُ أشهر.
     *
     * وتاريخا البداية والنهاية موجودان لثلاثةَ عشرَ فقط، ويوافقان قسمةَ المبلغ في
     * **اثنين**. وسببُ التنافر ظهر: الأسعارُ تغيّرت (١٬٤٩٩ ÷ ١٬١٩٩ = ١٫٢٥)، فسعرُ
     * اليوم لا يقيس شراءً قديماً.
     *
     * فلا يُخمَّن شيء: تُكتب المدّةُ من `billingCycle` لأنّه الحقلُ المعلَن الوحيد،
     * وتُعرَض الثلاثةُ معاً في الوسم ليقرّر خالد بنفسه.
     */
    const priceRow = plan && mc ? prices.find((p) => p.planId === plan.id && p.market === mc.market) ?? null : null;
    const monthsByAmount =
      priceRow && priceRow.monthlyBase > 0 && c.openingBalance
        ? c.openingBalance / priceRow.monthlyBase
        : null;
    const monthsByDates =
      c.subscriptionStartDate && c.subscriptionEndDate
        ? Math.round((c.subscriptionEndDate.getTime() - c.subscriptionStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
        : null;

    // تُقارَن المقاديرُ بعد التقريب: فرقُ يومٍ أو كسرُ قرشٍ ليس تناقضاً.
    const roundedAmount = monthsByAmount != null ? Math.round(monthsByAmount) : null;
    if (months != null && roundedAmount != null && roundedAmount !== months) {
      const exact = Number.isInteger(monthsByAmount) ? `${monthsByAmount}` : monthsByAmount!.toFixed(2);
      gaps.push(`المدّة متناقضة — الدورة ${months} شهراً · المبلغ ÷ سعر الباقة ${exact} شهر` +
                (monthsByDates != null ? ` · التواريخ ${monthsByDates} شهراً` : ""));
    } else if (months != null && monthsByDates != null && Math.abs(monthsByDates - months) > 1) {
      gaps.push(`المدّة متناقضة — الدورة ${months} شهراً · التواريخ ${monthsByDates} شهراً`);
    }

    // مبلغٌ أقلُّ من عشرة ليس دفعةً — قيمةٌ وُضعت ليمتلئ الحقل.
    if (c.openingBalance != null && c.openingBalance > 0 && c.openingBalance < 10) {
      gaps.push(`مبلغٌ مريب: ${c.openingBalance} — أقلُّ من أيّ سعرٍ معلَن`);
    }

    // ضريبةُ القيمة المضافة لا تُشتقّ من رصيدٍ افتتاحيّ: المبلغُ المخزَّن رقمٌ واحد
    // لا يقول أشاملٌ هو أم لا. تُترك صفراً ويُوسَم صفُّ السعوديّة — ومصرُ صفرٌ فعلاً.
    if (mc?.market === "SA" && totalMinor > 0) gaps.push("تفصيلُ الضريبة مجهول (السعوديّة ١٥٪)");

    return {
      clientId: c.id,
      clientName: c.name,
      salesRepId: c.salesRepId,
      planName: plan?.name ?? tierName,
      planSlug: plan?.slug ?? null,
      planId: plan?.id ?? null,
      articlesPerMonth: c.articlesPerMonth,
      market: mc?.market ?? null,
      currency: mc?.currency ?? null,
      totalMinor,
      paidMonths: months ?? 12,
      serviceStartedAt: c.subscriptionStartDate,
      activatedAt: c.createdAt,
      monthsByCycle: months,
      monthsByAmount: monthsByAmount != null ? Number(monthsByAmount.toFixed(2)) : null,
      monthsByDates,
      gaps,
    };
  });
}

/** جردٌ للقراءة: ما سيُمسح، وما سيُكتب لكلّ عميل، ومن يحتاج مراجعة. */
export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const refused = refuseIfNotDev();
  if (refused) return refused;

  const [orders, invoices, planned] = await Promise.all([
    db.checkoutOrder.count(),
    db.invoice.count(),
    planAll(),
  ]);

  return Response.json({
    willDelete: { checkout_orders: orders, invoices },
    planned: planned.map(serialise),
    totals: summarise(planned),
  });
}

function serialise(p: PlannedOrder) {
  return {
    ...p,
    serviceStartedAt: p.serviceStartedAt ? p.serviceStartedAt.toISOString().slice(0, 10) : null,
    activatedAt: p.activatedAt.toISOString().slice(0, 10),
  };
}

function summarise(planned: PlannedOrder[]) {
  const clean = planned.filter((p) => p.gaps.length === 0).length;
  const byCurrency: Record<string, { count: number; totalMinor: number }> = {};
  for (const p of planned) {
    const k = p.currency ?? "—";
    byCurrency[k] ??= { count: 0, totalMinor: 0 };
    byCurrency[k].count += 1;
    byCurrency[k].totalMinor += p.totalMinor;
  }
  return { clients: planned.length, clean, needsReview: planned.length - clean, byCurrency };
}

export async function POST(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const refused = refuseIfNotDev();
  if (refused) return refused;

  const startedAt = Date.now();
  const planned = await planAll();

  // ── ١) الإخلاء — التابعُ قبل المتبوع
  const deleted: Record<string, number> = {};
  for (const [name, run] of [
    ["payment_webhook_events", () => db.paymentWebhookEvent.deleteMany({})],
    ["payment_attempts", () => db.paymentAttempt.deleteMany({})],
    ["payment_transactions", () => db.paymentTransaction.deleteMany({})],
    ["invoices", () => db.invoice.deleteMany({})],
    ["checkout_orders", () => db.checkoutOrder.deleteMany({})],
  ] as const) {
    deleted[name] = (await run()).count;
  }
  // مؤشّراتُ الطلب الساري تُصفَّر مع الطلبات، وإلّا أشارت لطلبٍ محذوف.
  await db.client.updateMany({ where: {}, data: { activeOrderId: null } });

  // ── ٢) البناء
  const created: { number: string; clientName: string; currency: string | null; totalMinor: number; gaps: string[] }[] = [];
  const failed: { clientName: string; error: string }[] = [];

  for (const p of planned) {
    try {
      const number = await nextOrderNumber(db);
      const monthlyBaseMinor = p.paidMonths > 0 ? Math.round(p.totalMinor / p.paidMonths) : p.totalMinor;
      const buyer = await db.client.findUnique({
        where: { id: p.clientId },
        select: { name: true, email: true, phone: true },
      });

      const order = await db.checkoutOrder.create({
        data: {
          number,
          buyerName: buyer?.name ?? p.clientName,
          buyerEmail: buyer?.email ?? "",
          buyerPhone: buyer?.phone ?? "",
          country: p.market,
          market: p.market ?? "SA",
          currency: p.currency ?? "SAR",
          planId: p.planId,
          planSlug: p.planSlug ?? "unknown",
          planName: p.planName ?? "—",
          articlesPerMonth: p.articlesPerMonth,
          monthlyBaseMinor,
          paidMonths: p.paidMonths,
          bonusServiceMonths: 0,
          subtotalMinor: p.totalMinor,
          vatRateBp: 0,
          vatMinor: 0,
          totalMinor: p.totalMinor,
          status: "PAID",
          paidAt: p.serviceStartedAt,
          serviceStartedAt: p.serviceStartedAt,
          activatedAt: p.activatedAt,
          salesRepId: p.salesRepId,
          // تاريخُ الطلب = يومُ التفعيل، لا يومُ تشغيل الترحيل (خالد ١٨ سبتمبر ٢٠٢٦):
          // ٤٢ طلباً بتاريخٍ واحد هو يومُ الضغط على الزرّ لا يقول شيئاً عن العميل.
          createdAt: p.activatedAt,
          clientId: p.clientId,
          notes: p.gaps.length
            ? `⚠ ترحيلٌ يحتاج مراجعة — ${p.gaps.join(" · ")}`
            : "طلبٌ مُرحَّل من بيانات العميل القديمة",
        },
      });

      // معاملةٌ بمزوّد `MIGRATED`: الترحيلُ يكتب بوّابته بنفسه، فعمودُ البوّابة لا يستنتج،
      // وطلبٌ بلا معاملةٍ يبقى إشارةَ عطلٍ حقيقيّ لا حالةً تُفسَّر بحسن نيّة.
      await db.paymentTransaction.create({
        data: {
          orderId: order.id,
          provider: "MIGRATED",
          status: "MIGRATED",
          amountMinor: p.totalMinor,
          currency: p.currency ?? "SAR",
          providerReference: "rebuild-orders",
          settledAt: p.serviceStartedAt,
        },
      });

      // نهايةُ الاشتراك تُشتقّ من الطلب المبنيّ لتوّه — فيتطابق ما يراه العميلُ في بوّابته
      // مع ما يقوله الأدمن من أوّل لحظة (كان الانقسام صفرَ تطابقٍ من ٤٢).
      await db.client.update({
        where: { id: p.clientId },
        data: {
          activeOrderId: order.id,
          subscriptionEndDate: addMonthsTo(p.activatedAt, p.paidMonths),
        },
      });
      created.push({ number, clientName: p.clientName, currency: p.currency, totalMinor: p.totalMinor, gaps: p.gaps });
    } catch (error) {
      failed.push({ clientName: p.clientName, error: error instanceof Error ? error.message : String(error) });
    }
  }

  // ── ٣) التحقّق البعديّ — العدُّ المُعاد هو الدليل، لا ما ادّعاه الإنشاء
  const [orderCount, linkedCount, clientCount] = await Promise.all([
    db.checkoutOrder.count(),
    db.checkoutOrder.count({ where: { NOT: [{ clientId: null }] } }),
    db.client.count(),
  ]);
  const pointerCount = await db.client.count({ where: { NOT: [{ activeOrderId: null }] } });

  const clean =
    failed.length === 0 && orderCount === clientCount && linkedCount === clientCount && pointerCount === clientCount;

  return Response.json({
    clean,
    deleted,
    created: created.length,
    failed,
    verify: { clients: clientCount, orders: orderCount, ordersLinked: linkedCount, clientsPointing: pointerCount },
    needsReview: created.filter((c) => c.gaps.length > 0),
    totals: summarise(planned),
    durationMs: Date.now() - startedAt,
  });
}
