"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { buildOrderSnapshot } from "@modonty/shared/lib/payments/build-order-snapshot";
import { nextOrderNumber } from "@modonty/shared/lib/payments/next-order-number";
import { vatRateBpForMarket } from "@modonty/shared/lib/payments/vat-rate";
import { toE164 } from "@modonty/shared/lib/phone";

import { db } from "@/lib/db";
import { requireSalesDesk } from "@/lib/require-sales-desk";
import { logAction } from "@/lib/audit/log-action";
import { linkOrderToClient } from "@/lib/orders/link-order-to-client";
import { findClientByIdentity } from "@/lib/orders/find-client-by-identity";
import { getSubscriptionTerm } from "@modonty/shared/lib/subscription/subscription-term";

/**
 * طلب اشتراك يُسجَّل من الأدمن — المنفذ الثاني، ونفس الصفّ الذي تكتبه صفحة الدفع.
 *
 * -- لماذا وُجد (خالد ١٥ سبتمبر ٢٠٢٦) --
 * «احنا عندنا منفذ البيع بوابات الدفع… أو إضافة اشتراك يدوي». واليوم للعميل ثلاثة
 * أبواب تكتب حقولاً مختلفة على نفس الصفّ: شراءٌ من صفحة الدفع، وتحويلُ عميلٍ محتمل
 * يمرّر التصنيف والمندوب فقط، وإنشاءٌ يدويّ. ومن الباب الثاني جاء — مقيسٌ على
 * الإنتاج — **٢٠ عميلاً بلا مندوب و٢٣ بلا تاريخ نهاية** من أصل ٤١.
 *
 * فالطلب يصير المرحلة الأولى لكل مشترك مهما كان مصدره، لأنه هو الذي يلقط الباقة
 * والسعر والمدّة. والعملاء القائمون يُعاد إدخالهم من هنا ليصير للجميع سجلٌّ واحد.
 *
 * -- لا حساب هنا --
 * `buildOrderSnapshot` و`nextOrderNumber` هما اللذان يستعملهما مسارا الدفع
 * (`create-payment` و`bank-transfer`). فنسخةٌ ثانية من حساب الضريبة أو ترقيم الطلب
 * تعني رقمين يفترقان بعد أوّل تعديل — والسعر يُقرأ من الكتالوج لا من المدخل، فلا
 * يكتب أحدٌ مبلغاً بيده.
 */

const Body = z.object({
  market: z.enum(["SA", "EG"]),
  /** فارغ = باقة «أخرى»، وعندها تُقرأ الحقول الثلاثة أدناه بدل الكتالوج. */
  planId: z.string().trim().optional(),
  paidMonths: z.coerce.number().int().min(1, "المدّة شهرٌ على الأقل").max(36, "المدّة أطول من ٣٦ شهراً"),
  /**
   * -- باقة «أخرى» (خالد ١٥ سبتمبر ٢٠٢٦) --
   * «ندخل من خلالها العملاء القدام، ولو في أي خصومات، أو عميل نازل مجاني».
   * فهي ليست باقةً في الكتالوج بل اتفاقٌ خاصّ: الإجمالي وعدد المقالات والأشهر
   * تُكتب بيد الموظّف. و`customTotal = 0` مسموح — هو الحساب المجانيّ.
   *
   * ⚠ الرقم المكتوب **شامل الضريبة**، كأسعار الكتالوج (PAY-Q7) — فتُشتقّ منه
   * بالمعادلة نفسها في `buildOrderSnapshot`، لا تُضاف فوقه.
   */
  customName: z.string().trim().max(80).optional(),
  customTotal: z.coerce.number().int().min(0, "المبلغ لا يكون سالباً").max(10_000_000, "المبلغ كبير جداً").optional(),
  customArticlesPerMonth: z.coerce.number().int().min(0).max(999, "عدد المقالات كبير جداً").optional(),
  /**
   * رسائل عربية على كل حقل — لا رسالة زود الافتراضية.
   *
   * قيس ١٥ سبتمبر ٢٠٢٦: الحفظ بفورمٍ فارغ كان يرجع «String must contain at least 1
   * character(s)» — إنجليزيةً ولا تقول أيّ حقل. والموظّف يقرؤها فلا يعرف ماذا يصلح.
   */
  buyerName: z.string().trim().min(1, "اكتب اسم العميل").max(100, "الاسم طويل"),
  buyerEmail: z.string().trim().email("الإيميل غير صالح").max(254),
  /** يُطبَّع إلى E.164 — الرقم الذي يصله التأكيد والفاتورة. */
  buyerPhone: z.string().trim().min(6, "اكتب رقم الجوال").max(20, "الرقم طويل"),
  businessName: z.string().trim().max(120).optional(),
  salesRepId: z.string().trim().optional(),
  /**
   * `PAID` وحدها (خالد ١٥ سبتمبر ٢٠٢٦): «بانتظار التحويل ما بتواجهها إلا في مصر،
   * لكن العميل السعودي بيدفع عن طريق بوابات الدفع».
   *
   * أي أنّ الطلب المعلَّق تفتحه صفحة الدفع نفسها — تدخلها فاتن بدل العميل فتخرج له
   * بيانات الحساب ورقم الطلب. وهذا الفورم يسجّل ما **وصل** بالفعل: تحويلٌ مؤكَّد،
   * أو نقدٌ، أو عميلٌ قائم يُرحَّل. فحالةٌ ثانية هنا تكرّر مساراً يؤدّيه غيرها أحسن.
   */
  status: z.literal("PAID"),
  /** تاريخ الدفع — يُكتب كما هو لأن العميل القديم دفع قبل شهور، لا اليوم. */
  paidAt: z.string().trim().optional(),
  /** ملاحظة داخليّة — لا تُعرض للعميل ولا تُطبع على الفاتورة. */
  notes: z.string().trim().max(500).optional(),
  /**
   * **حسابٌ لنا لا بيعٌ لغيرنا** (خالد ١٩ سبتمبر ٢٠٢٦).
   *
   * كان يُفرض من شاشةِ إنشاءٍ منفصلة (`/clients/new`)، فصار لميلاد العميل بابان.
   * نزل إلى الطلب ليصير البابُ واحداً — والوسمُ يُنسخ إلى الكرت لحظةَ التفعيل.
   */
  isInternal: z.boolean().optional(),
  /**
   * العميل المحتمَل الذي جاء منه هذا الطلب (يُمرَّر من `/orders/new?leadId=`).
   *
   * كان تحويلُ المحتمَل يسأل «اختر الباقة» ويكتبها على كرتٍ جديد — بابُ ميلادٍ ثالث
   * بفلوسٍ مكتوبةٍ باليد. صار يمرّ من هنا: طلبٌ بمبلغٍ حقيقيّ، ومنه يُولد العميل.
   */
  leadId: z.string().trim().optional(),
  /**
   * الطلب الذي يُجدَّد (`/orders/new?renewFrom=`). العميلُ واحدٌ والطلباتُ متعدّدة (خالد ١ أكتوبر
   * ٢٠٢٦: «مش كل طلب له عميل جديد»): التجديدُ يُضاف لحساب صاحب ذلك الطلب لحظةَ الحفظ.
   * والحسابُ يُقرأ هنا من الطلب نفسه، لا من المتصفّح — فمعرّفٌ مزوَّر لا يربط صفقةً بغير صاحبها.
   */
  renewFromOrderId: z.string().regex(/^[0-9a-f]{24}$/i).optional(),
});

type CreateManualOrderInput = z.input<typeof Body>;

type CreateManualOrderResult =
  | { ok: true; id: string; number: string }
  /** `renewHref` — the buyer is already a client: renew from his current order instead. */
  | { ok: false; error: string; renewHref?: string };

export async function createManualOrder(input: CreateManualOrderInput): Promise<CreateManualOrderResult> {
  await requireSalesDesk();

  const parsed = Body.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "تحقّق من البيانات" };
  }
  /**
   * **التجديدُ لا يغيّر هويّةَ العميل** (خالد ١ أكتوبر ٢٠٢٦: «اللي بتغير المبلغ والتكلفة، لكن
   * البيانات الأساسية للعميل مستحيل تتغير»). الاسمُ والإيميلُ والجوالُ والنشاطُ والسوقُ تُقرأ
   * هنا من الطلب المجدَّد نفسِه — والحقولُ مقفلةٌ في الصفحة، وهذا ما يجعل القفلَ حقيقيّاً:
   * ما يُرسله المتصفّح لهذه الخمسة يُهمَل.
   */
  const renewSource = parsed.data.renewFromOrderId
    ? await db.checkoutOrder.findUnique({
        where: { id: parsed.data.renewFromOrderId },
        select: { number: true, clientId: true, buyerName: true, buyerEmail: true, buyerPhone: true, businessName: true, market: true },
      })
    : null;
  if (parsed.data.renewFromOrderId && !renewSource) return { ok: false, error: "الطلب المجدَّد غير موجود" };
  const body = renewSource
    ? {
        ...parsed.data,
        buyerName: renewSource.buyerName,
        buyerEmail: renewSource.buyerEmail,
        buyerPhone: renewSource.buyerPhone,
        businessName: renewSource.businessName ?? undefined,
        market: renewSource.market === "EG" || renewSource.market === "SA" ? renewSource.market : parsed.data.market,
      }
    : parsed.data;

  const { e164, reason } = toE164(body.buyerPhone);
  if (!e164) return { ok: false, error: reason ?? "رقم غير صالح" };

  /**
   * **بابان لا ثلاثة: عميلٌ جديد أو تجديد.** «اشتراك جديد» بإيميلٍ أو جوالٍ لعميلٍ موجود كان يُحفظ
   * طلباً ثانياً بلا حساب، ثمّ يرفضه التفعيلُ (الإيميل والجوال فريدان) فيُرقَّع بزرّ «ربط». يُوقف
   * هنا قبل أيّ كتابة، ويُدَلّ المندوبُ على تجديده — والتجديدُ نفسُه يمرّ (هويّتُه هويّةُ العميل).
   */
  if (!renewSource) {
    const existing = await findClientByIdentity({ email: body.buyerEmail, phone: e164 });
    if (existing) {
      return {
        ok: false,
        error: `${existing.matchedOn === "email" ? "الإيميل" : "رقم الجوال"} لعميلٍ موجود «${existing.name}» — هذا تجديدٌ لا اشتراكٌ جديد.`,
        renewHref: existing.activeOrderId ? `/orders/new?renewFrom=${existing.activeOrderId}` : `/clients/${existing.id}`,
      };
    }
  }

  const vatRateBp = vatRateBpForMarket(body.market);
  const currency = body.market === "EG" ? "EGP" : "SAR";

  let snapshot: ReturnType<typeof buildOrderSnapshot>;
  let planLabel: string;

  if (body.planId) {
    const plan = await db.commercialPlan.findFirst({
      where: { id: body.planId, isPublished: true },
      select: {
        id: true,
        slug: true,
        name: true,
        articlesPerMonth: true,
        prices: {
          where: { market: body.market, isActive: true },
          select: { market: true, currency: true, monthlyBase: true },
          take: 1,
        },
      },
    });

    const price = plan?.prices[0];
    if (!plan || !price) return { ok: false, error: "الباقة غير منشورة أو بلا سعر لهذا السوق" };

    const term = await db.commercialTermPolicy.findFirst({
      where: { paidMonths: body.paidMonths, isActive: true },
      select: { paidMonths: true, bonusServiceMonths: true },
    });
    if (!term) return { ok: false, error: "هذه المدّة غير مفعّلة في سياسة المدد" };

    snapshot = buildOrderSnapshot({
      plan: { id: plan.id, slug: plan.slug, name: plan.name, articlesPerMonth: plan.articlesPerMonth },
      price: { market: price.market, currency: price.currency, monthlyBase: price.monthlyBase },
      term: { paidMonths: term.paidMonths, bonusServiceMonths: term.bonusServiceMonths },
      vatRateBp,
    });
    if (snapshot.totalMinor <= 0) return { ok: false, error: "الإجمالي صفر — راجع سعر الباقة" };
    planLabel = plan.name;
  } else {
    /**
     * باقة «أخرى» — لا تمرّ بـ`buildOrderSnapshot` لأنّها لا تملك سعر شهرٍ في الكتالوج.
     * لكنّ **معادلة الضريبة هي هي** (`subtotal = total × 10000 ÷ (10000 + bp)`): نسخةٌ
     * ثانية بمعادلةٍ مختلفة تعني فاتورتين لا تتّفقان على الضريبة.
     *
     * و`bonusServiceMonths = 0`: الهدية سياسةُ مدّةٍ في الكتالوج، والاتفاق الخاصّ
     * يكتب أشهره كاملةً بيده فلا هدية فوقها.
     */
    if (body.customTotal == null || body.customArticlesPerMonth == null) {
      return { ok: false, error: "اكتب الإجمالي وعدد المقالات لباقة «أخرى»" };
    }
    const totalMinor = body.customTotal * 100;
    const subtotalMinor = Math.round((totalMinor * 10_000) / (10_000 + vatRateBp));
    snapshot = {
      market: body.market,
      currency,
      planId: null as unknown as string,
      planSlug: "custom",
      planName: body.customName?.trim() || "اتفاق خاصّ",
      articlesPerMonth: body.customArticlesPerMonth,
      monthlyBaseMinor: Math.round(totalMinor / body.paidMonths),
      paidMonths: body.paidMonths,
      bonusServiceMonths: 0,
      subtotalMinor,
      vatRateBp,
      vatMinor: totalMinor - subtotalMinor,
      totalMinor,
    };
    planLabel = snapshot.planName;
  }

  const paidAt = body.paidAt ? new Date(body.paidAt) : new Date();
  if (Number.isNaN(paidAt.getTime())) return { ok: false, error: "تاريخ الدفع غير صالح" };

  const order = await db.checkoutOrder.create({
    data: {
      number: await nextOrderNumber(db),
      ...snapshot,
      planId: snapshot.planId ?? null,
      buyerName: body.buyerName,
      buyerEmail: body.buyerEmail,
      buyerPhone: e164,
      businessName: body.businessName || null,
      country: body.market,
      planCommitments: [],
      status: body.status,
      salesRepId: body.salesRepId || null,
      notes: body.notes || null,
      isInternal: body.isInternal ?? false,
      leadId: body.leadId || null,
      paidAt,
    },
    select: { id: true, number: true },
  });

  await logAction("order.manual_create", {
    entity: "Settings",
    summary: `طلب اشتراك يدويّ ${order.number} — ${planLabel} · ${body.market}`,
    metadata: {
      orderId: order.id,
      market: body.market,
      planName: planLabel,
      isCustom: !body.planId,
      paidMonths: snapshot.paidMonths,
      totalMinor: snapshot.totalMinor,
      status: body.status,
      salesRepId: body.salesRepId ?? null,
    },
  });

  /**
   * التجديد على الحساب نفسه — بنفس باب «ربط بالعميل القائم» (`linkOrderToClient`): يكتب العميلَ
   * على الطلب، ويجعله الصفقةَ السارية، ويعيد حسابَ نهاية الاشتراك. كان يُحفظ بلا عميل فيظهر
   * في الاشتراكات صفّاً ثانياً «بلا حساب بعد» لنفس العميل حتى يُربط بيدٍ في خطوةٍ ثانية تُنسى.
   */
  if (renewSource && body.status === "PAID") {
    const source = renewSource;
    if (source.clientId) {
      /**
       * **متى تبدأ مدّةُ التجديد** (خالد ١ أكتوبر ٢٠٢٦، الخيار «أ»): من نهاية الاشتراك الحالي إن
       * كان لم ينتهِ بعد — فلا يضيع على العميل يومٌ دفع ثمنه — ومن يوم الدفع إن كان قد انتهى.
       * كانت تبدأ مع أوّل مقالٍ يصله بعد التجديد، فمَن جدّد مبكّراً يخسر ما بقي من القديم، ومَن
       * جدّد بعد الانتهاء يبقى بلا تاريخ نهايةٍ حتى يُكتب له مقال.
       * تُحسب قبل الربط: الربطُ يجعل هذا الطلبَ هو الساري، فيضيع الطلبُ الذي نقيس نهايته.
       * وختمُ `serviceStartedAt` هنا يجعل ساعةَ أوّل مقال (`start-service-clock.ts`) لا تلمسه.
       */
      const owner = await db.client.findUnique({ where: { id: source.clientId }, select: { activeOrderId: true } });
      const current = owner?.activeOrderId
        ? await db.checkoutOrder.findUnique({ where: { id: owner.activeOrderId }, select: { serviceStartedAt: true, paidMonths: true, bonusServiceMonths: true } })
        : null;
      const currentEnd = current ? getSubscriptionTerm(current).endsAt : null;
      const startsAt = currentEnd && currentEnd > paidAt ? currentEnd : paidAt;
      await db.checkoutOrder.update({ where: { id: order.id }, data: { serviceStartedAt: startsAt } });
      await linkOrderToClient(order.id, source.clientId);
      await logAction("order.update", {
        entity: "Order",
        entityId: order.id,
        summary: `تجديد ${source.number} ← ${order.number} أُضيف لحساب العميل نفسه`,
        metadata: { clientId: source.clientId, renewFrom: body.renewFromOrderId, via: "renewal-auto-link" },
      });
    }
  }

  revalidatePath("/orders");
  return { ok: true, id: order.id, number: order.number };
}
