import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * **حسابُ ما سيُكتب — بلا أيّ كتابة.**
 *
 * خرجت من `route.ts` لمّا صار لها مستهلكان: المسارُ ينفّذ بها، وصفحةُ
 * `orders-migration` تعرض بها الجردَ والمشاكل قبل الضغط. واستيرادُ صفحةٍ من
 * `route.ts` يسحب معه `dynamic`/`runtime`/`maxDuration` وكلَّ ما في المسار.
 *
 * وهي مصدرُ الحقيقة الواحد: ما يُعرَض قبل الضغط هو ما يُكتب بعده حرفاً بحرف. عرضٌ
 * يُحسب بطريقٍ وكتابةٌ بطريقٍ آخر هو كيف يكذب جدولُ المعاينة.
 */

/**
 * بلدُ العميل نصٌّ حرّ: بعضُه `EG`/`SA` وبعضُه «المملكة العربية السعودية».
 * نفسُ القاعدة المستعملة في تقرير المبيعات (`get-sales-report.ts:86`) — مصدرٌ واحد
 * لقراءة العملة، فلا يفترق رقمُ الترحيل عن رقم التقرير.
 */
export function marketForCountry(country: string | null): { market: "SA" | "EG"; currency: "SAR" | "EGP" } | null {
  const c = (country ?? "").trim().toLowerCase();
  if (!c) return null;
  if (/مصر|egypt|\beg\b/.test(c)) return { market: "EG", currency: "EGP" };
  if (/سعود|saudi|\bksa\b|\bsa\b/.test(c)) return { market: "SA", currency: "SAR" };
  return null;
}

/** دورةُ الفوترة → شهورٌ مدفوعة. `annual` سنةٌ كاملة، `monthly` شهرٌ واحد. */
export function monthsForCycle(cycle: string | null): number | null {
  if (cycle === "annual") return 12;
  if (cycle === "monthly") return 1;
  return null;
}

export interface PlannedOrder {
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
/**
 * **اسمُ الباقة القديم — يُقرأ خامّاً من مونغو لا عبر Prisma (١٩ سبتمبر ٢٠٢٦).**
 *
 * سقط `SubscriptionTierConfig` من السكيما، وبقيت مجموعتُه وقيمُه في القاعدة كما هي
 * («If a model or field is not present in the Prisma schema, it is ignored» — توثيق
 * Prisma للمونغو). والترحيلُ وحدَه يحتاجها: هي مصدرُ الربط بين باقة العميل القديمة
 * وصفِّها في الكتالوج، ولا يُبنى بدونها على قاعدةٍ لم تُرحَّل بعد.
 *
 * فيُقرأ الجدولُ المهجورُ خامّاً، ويبقى هذا الراوتُ قادراً على العمل على الإنتاج بعد
 * أن خرج الكتالوجُ من كلّ شيفرةٍ أخرى. وترجع خريطةُ `clientId → اسم الباقة`.
 */
async function legacyTierNameByClient(): Promise<Map<string, string>> {
  type Raw = { _id: { $oid: string } | string; name?: string; subscriptionTierConfigId?: { $oid: string } | string };
  const oid = (v: Raw["_id"]) => (typeof v === "string" ? v : v.$oid);

  const [tierRows, clientRows] = await Promise.all([
    db.$runCommandRaw({ find: "subscription_tier_configs", filter: {}, projection: { name: 1 }, batchSize: 500 }),
    db.$runCommandRaw({ find: "clients", filter: {}, projection: { subscriptionTierConfigId: 1 }, batchSize: 1000 }),
  ]);

  const batch = (r: unknown): Raw[] =>
    ((r as { cursor?: { firstBatch?: Raw[] } }).cursor?.firstBatch ?? []) as Raw[];

  const nameByTierId = new Map(batch(tierRows).map((t) => [oid(t._id), t.name ?? ""]));
  const out = new Map<string, string>();
  for (const c of batch(clientRows)) {
    const ref = c.subscriptionTierConfigId;
    if (!ref) continue;
    const name = nameByTierId.get(typeof ref === "string" ? ref : ref.$oid);
    if (name) out.set(oid(c._id), name);
  }
  return out;
}

export async function planAll(): Promise<PlannedOrder[]> {
  const legacyTierName = await legacyTierNameByClient();
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

  /**
   * **بدايةُ الخدمة = أوّلُ مقالٍ وصل العميل** (خالد ١٩ سبتمبر ٢٠٢٦: «المفروض من الترحيل
   * تشوف أوّل أرتيكل»).
   *
   * كانت تُنسخ من `Client.subscriptionStartDate` — وهو حقلٌ قديمٌ يقول يومَ فتح الحساب،
   * فيبدأ احتسابُ الاشتراك من يوم الدفع ويأكل من العميل مدّةَ التجهيز كلَّها.
   *
   * وللصفوف القديمة لا وجودَ لـ`firstDeliveredAt` (الحقلُ وُلد اليوم بلا تاريخ)، فيُقرأ
   * أقدمُ أثرٍ يثبت وصولَ مقالٍ فعلاً: `MIN(datePublished)` للمنشور. ومَن لا مقالَ له
   * تبقى بدايتُه فارغةً ويُوسَم — خدمتُه لم تبدأ، ولا يُخمَّن لها تاريخ.
   */
  const firstDelivery = new Map<string, Date>();
  const delivered = await db.article.groupBy({
    by: ["clientId"],
    where: { status: ArticleStatus.PUBLISHED, datePublished: { not: null } },
    _min: { datePublished: true },
  });
  for (const row of delivered) {
    if (row.clientId && row._min.datePublished) firstDelivery.set(row.clientId, row._min.datePublished);
  }

  return clients.map((c) => {
    const gaps: string[] = [];

    // الرابط: اسمُ باقة الجدول القديم ↔ اسمُ باقة الكتالوج.
    //
    // قيس الرابطان الممكنان معاً (الاسم، والفئة في بيانات `commercial_plans`) فاتّفقا
    // في ٤٠ من ٤٢ واختلفا في صفر. والاسمُ هو الباقي في السكيما بعد سقوط `tier`، فهو
    // المعتمَد. والاثنان اللذان لا مقابلَ لهما باقتُهما «مجاني» — لا صفَّ لها في
    // الكتالوج أصلاً، فتُوسَم ولا تُخمَّن.
    const tierName = legacyTierName.get(c.id) ?? null;
    const plan = tierName ? plans.find((p) => p.name === tierName) ?? null : null;
    if (!tierName) gaps.push("بلا باقة في الجدول القديم");
    else if (!plan) gaps.push(`باقة «${tierName}» بلا صفٍّ في الكتالوج`);

    if (c.articlesPerMonth == null) gaps.push("بلا حصّةٍ شهريّة");
    if (!firstDelivery.has(c.id)) gaps.push("لم يصله مقالٌ بعد — ساعةُ الاشتراك لم تبدأ");

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
      // فارغةٌ لمن لم يصله مقالٌ بعد — ساعتُه لم تبدأ، فلا نهايةَ تُحسب له.
      serviceStartedAt: firstDelivery.get(c.id) ?? null,
      activatedAt: c.createdAt,
      monthsByCycle: months,
      monthsByAmount: monthsByAmount != null ? Number(monthsByAmount.toFixed(2)) : null,
      monthsByDates,
      gaps,
    };
  });
}

/** نهايةُ الاشتراك = يومُ التفعيل + الشهور — نفسُ صيغة `recompute-subscription-end.ts`. */
export function addMonthsTo(from: Date, months: number): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  return d;
}

