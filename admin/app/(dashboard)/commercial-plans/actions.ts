"use server";

import { CommercialPlanTheme, Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isFeatureUnitLabel } from "@modonty/shared/lib/commercial/feature-unit-labels";
import { isPayMarkName } from "@modonty/shared/lib/commercial/pay-mark-names";
import { db } from "@/lib/db";
import { requireFinanceAdmin } from "@/lib/require-finance-admin";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

function value(form: FormData, key: string): string { return String(form.get(key) ?? "").trim(); }

const optionalText = (max: number) => z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : null), z.string().max(max).nullable());
const featureSchema = z.object({
  name: z.string().trim().min(1, "اسم الميزة مطلوب").max(80, "اسم الميزة طويل جداً"),
  description: optionalText(300),
  /**
   * قائمة مغلقة لا نصّ حرّ (خالد ١٤ سبتمبر ٢٠٢٦). الكتابة اليدوية أنتجت «مقال/شهر»
   * و«مقال / شهر» لنفس المعنى، وحساب إجمالي المدّة يميّز الشهريّ بلاحقة «/شهر» —
   * فمسافةٌ زائدة كانت تُسقط الرقم بصمت.
   */
  unitLabel: z.preprocess(
    (v) => (typeof v === "string" && v.trim() ? v.trim() : null),
    z.string().nullable().refine((v) => v === null || isFeatureUnitLabel(v), "وحدة غير موجودة في القائمة"),
  ),
});
function parseFeature(form: FormData) {
  const parsed = featureSchema.safeParse({ name: value(form, "name"), description: value(form, "description"), unitLabel: value(form, "unitLabel") });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "تحقق من بيانات الميزة");
  return parsed.data;
}

type Direction = "up" | "down";
/**
 * Swap with the neighbour and return ONLY the rows whose `displayOrder` must change.
 * Normally that is the two swapped rows; rows left with duplicate/gapped orders by the
 * `count()`-based inserts get normalised to 0..n-1 in the same batch. Writing every row
 * blew Prisma's 5s interactive-transaction budget on Atlas (27 features) — measured.
 */
function moveInList(rows: { id: string; displayOrder: number }[], id: string, direction: Direction): { id: string; displayOrder: number }[] {
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) throw new Error("العنصر غير موجود");
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= rows.length) return [];
  const order = [...rows];
  [order[index], order[target]] = [order[target], order[index]];
  return order.map((row, displayOrder) => ({ id: row.id, displayOrder })).filter((next) => rows.find((row) => row.id === next.id)?.displayOrder !== next.displayOrder);
}

const updatePlanSchema = z.object({
  name: z.string().trim().min(1, "اسم الباقة مطلوب").max(60, "اسم الباقة طويل جداً"),
  badge: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : null), z.string().max(30).nullable()),
  hook: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : null), z.string().max(60, "السطر الخاطف طويل — اجعله جملة واحدة").nullable()),
  ctaText: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : null), z.string().max(30, "نصّ الزرّ طويل").nullable()),
  featuredBadge: z.preprocess((v) => (typeof v === "string" && v.trim() ? v.trim() : null), z.string().max(30).nullable()),
  theme: z.nativeEnum(CommercialPlanTheme),
  /**
   * سطور تسويق حرّة تظهر فوق المزايا (PAY-G12). تُكتب سطراً لكل جملة في مربّع واحد،
   * فالمحرّر يراها كما تُعرض. الحدود مقصودة: ٦ سطور × ٨٠ حرفاً — بطاقةٌ بعشرين سطر حرّ
   * تُغرق قائمة المزايا المُهيكلة تحتها، وهي مصدر الحقيقة للكمّيات.
   */
  highlights: z.preprocess(
    (v) => (typeof v === "string" ? v.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 6) : []),
    z.array(z.string().max(80, "السطر طويل — اجعله جملة قصيرة")),
  ),
});

/**
 * إبطال كاش الكتالوج — نداءٌ واحد يجمع الأدمن ومدونتي (PAY-C1).
 *
 * لماذا دالّة لا سطران في كل أكشن: الملفّ فيه واحد وعشرون أكشناً تمسّ الكتالوج، وأكشنٌ
 * واحد يُنسى = صفحة بيع تعرض سعراً قديماً بلا أن يلاحظ أحد. الدالّة تجعل النسيان مرئياً:
 * أيّ أكشن لا يستدعيها يظهر في `grep` بسطر واحد.
 *
 * ولا تُفشل الأكشن: `revalidateModontyTag` يبتلع أخطاء الشبكة بنفسه — وفشلُ إبطال كاش
 * لا يبرّر رفض حفظٍ نجح في القاعدة.
 */
async function revalidateCatalog(planId?: string) {
  /**
   * ⚠ كانت تنادي **نفسها** بلا شرط توقّف (`await revalidateCatalog()`)، فكل حفظٍ في
   * الكتالوج يدخل استدعاءً لا نهائياً. وُجدت في ١٤ سبتمبر ٢٠٢٦ أثناء بناء ما قبل الدفع —
   * وهي في الكوميتات غير المدفوعة، أي أنها لم تصل الإنتاج. والمقصود بيّن: تفريغ صفحتَي
   * الأدمن ثم إبطال وسم صفحة البيع.
   */
  revalidatePath("/commercial-plans");
  revalidatePath("/commercial-features");
  if (planId) revalidatePath(`/commercial-plans/${planId}`);
  /**
   * وصفحات دليل الفريق معها (١٥ سبتمبر ٢٠٢٦): صار `get-tier-pricing.ts` يقرأ من
   * الكتالوج، وهو مُكاش `unstable_cache` بساعة. ولم يكن أحدٌ يُبطل وسمه قطّ —
   * فتعدّل السعر هنا ويبقى فريق المبيعات يقرأ القديم ساعةً كاملة ويقوله للعميل.
   */
  revalidateTag("tier-pricing", { expire: 0 });
  await revalidateModontyTag("commercial-catalog");
}

/**
 * Read-only name lookup for the breadcrumb (see `breadcrumb-actions.ts`), same
 * unguarded pattern as `getArticleById`/`getClientById`/etc — the plan's own
 * name isn't sensitive, and mutation stays behind `requireFinanceAdmin`.
 * Without this the breadcrumb falls through its default case and shows the
 * raw ObjectId instead of the plan name on `/commercial-plans/[id]`.
 */
export async function getCommercialPlanName(id: string): Promise<string | null> {
  const plan = await db.commercialPlan.findUnique({ where: { id }, select: { name: true } });
  return plan?.name ?? null;
}

export async function createCommercialPlan(form: FormData) {
  await requireFinanceAdmin();
  const name = value(form, "name");
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "plan";
  const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
  const sa = Number(value(form, "sa"));
  const eg = Number(value(form, "eg"));
  const articlesPerMonth = Number(value(form, "articlesPerMonth"));
  if (!name || !slug || !Number.isInteger(sa) || sa < 0 || !Number.isInteger(eg) || eg < 0 || !Number.isInteger(articlesPerMonth) || articlesPerMonth < 0) throw new Error("تحقق من الاسم والأسعار وعدد المقالات.");

  await db.commercialPlan.create({ data: {
    name, slug, articlesPerMonth, highlights: [], displayOrder: await db.commercialPlan.count(),
    prices: { create: [{ market: "SA", currency: "SAR", monthlyBase: sa }, { market: "EG", currency: "EGP", monthlyBase: eg }] },
  }});
  await revalidateCatalog();
}

export async function updateCommercialPlan(id: string, form: FormData) {
  await requireFinanceAdmin();
  const parsed = updatePlanSchema.safeParse({ name: value(form, "name"), badge: value(form, "badge"), theme: value(form, "theme"), highlights: form.get("highlights"), hook: value(form, "hook"), ctaText: value(form, "ctaText"), featuredBadge: value(form, "featuredBadge") });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "تحقق من بيانات الباقة");
  // شارة التمييز على باقة واحدة فقط: بطاقتان «مميَّزتان» ليستا تمييزاً أقوى، بل لا تمييز.
  // الحارس هنا لا في السكيما — مونجو لا يملك قيداً جزئياً يقول «حقل غير فارغ في صفّ واحد».
  // نفس مبدأ `setRecommendedCommercialTerm`: المسح والكتابة في معاملة واحدة.
  // النوع `PrismaPromise<unknown>` صراحةً: المصفوفة تُستنتج من أوّل عنصرٍ فيها، فيصير
  // نوعها «تحديث باقة واحدة»، ثم يرفض `unshift` نتيجةَ `updateMany` (BatchPayload).
  // كشفه البناء (١٤ سبتمبر ٢٠٢٦) — والتشغيل كان يعمل، فالخطأ في الأنواع لا في المنطق.
  const writes: Prisma.PrismaPromise<unknown>[] = [
    db.commercialPlan.update({ where: { id }, data: { name: parsed.data.name, badge: parsed.data.badge, theme: parsed.data.theme, highlights: parsed.data.highlights, hook: parsed.data.hook, ctaText: parsed.data.ctaText, featuredBadge: parsed.data.featuredBadge } }),
  ];
  if (parsed.data.featuredBadge) {
    writes.unshift(db.commercialPlan.updateMany({ where: { id: { not: id }, featuredBadge: { not: null } }, data: { featuredBadge: null } }));
  }
  await db.$transaction(writes);
  await revalidateCatalog(id);
}

export async function setCommercialPlanPublished(id: string, isPublished: boolean) {
  await requireFinanceAdmin();
  if (isPublished) {
    /**
     * **سقط قفصُ «أربع باقاتٍ للأبد» (١٧ سبتمبر ٢٠٢٦).**
     *
     * كان هنا شرطان: فئةُ اشتراكٍ إلزاميّة قبل النشر، وباقةٌ واحدة منشورة لكل فئة.
     * والفئات أربع (`SubscriptionTier`)، فالسقف أربع باقاتٍ مهما كبر العرض.
     *
     * وُجد الشرطان ليجد القارئُ الباقةَ بلا لبس — وكان يبحث بالفئة لأنّ السلَق هاش.
     * صار للباقات سلَقٌ ذو معنى (`intilaqa` · `zakham` · `riyada`) وهو `@unique` في
     * السكيما، فالبحثُ به لا يلتبس ولا يحدّ العدد.
     *
     * والباقي: السلَق مطلوبٌ قبل النشر — فبه يُنادى في رابط الدفع.
     */
    const plan = await db.commercialPlan.findUnique({ where: { id }, select: { slug: true } });
    if (!plan?.slug?.trim()) throw new Error("حدّد سلَق الباقة قبل النشر");
  }
  await db.commercialPlan.update({ where: { id }, data: { isPublished } });
  await revalidateCatalog(id);
}

export async function updateCommercialPlanPrice(id: string, form: FormData) {
  await requireFinanceAdmin();
  const amount = Number(form.get("amount"));
  if (!Number.isInteger(amount) || amount < 0) throw new Error("سعر غير صحيح");
  await db.commercialPlanPrice.update({ where: { id }, data: { monthlyBase: amount } });
  await revalidateCatalog(String(form.get("planId")));
}

export async function updateCommercialPlanMarketPrices(planId: string, form: FormData) {
  await requireFinanceAdmin();
  const sa = Number(value(form, "sa")); const eg = Number(value(form, "eg"));
  const articlesPerMonth = Number(value(form, "articlesPerMonth"));
  if (!Number.isInteger(sa) || sa < 0 || !Number.isInteger(eg) || eg < 0 || !Number.isInteger(articlesPerMonth) || articlesPerMonth < 0) throw new Error("تحقق من السعر وعدد المقالات");
  await db.$transaction([
    db.commercialPlanPrice.updateMany({ where: { planId, market: "SA" }, data: { monthlyBase: sa } }),
    db.commercialPlanPrice.updateMany({ where: { planId, market: "EG" }, data: { monthlyBase: eg } }),
    db.commercialPlan.update({ where: { id: planId }, data: { articlesPerMonth } }),
  ]);
  await revalidateCatalog();
}

const MARKETS = ["SA", "EG"] as const;

/** أسماء الشعارات تُكتب مفصولة بفواصل أو مسافات، وتُرفض أي كلمة خارج القائمة المغلقة. */
const payMarkList = z.preprocess(
  (v) => (typeof v === "string" ? v.split(/[,\s]+/).map((t) => t.trim()).filter(Boolean) : []),
  z.array(z.string()).refine((names) => names.every(isPayMarkName), "شعار غير موجود في القائمة المغلقة"),
);

const paySectionSchema = z.object({
  announcement: optionalText(120),
  headline: optionalText(120),
  subheadline: optionalText(300),
  vatNote: optionalText(80),
  installmentLabel: optionalText(40),
  refundNote: optionalText(120),
  paymentFootnote: optionalText(160),
  paymentFootnoteSub: optionalText(80),
  teamHeadline: optionalText(60),
  teamSubheadline: optionalText(140),
  payMarks: payMarkList,
  installmentMark: z.preprocess(
    (v) => (typeof v === "string" && v.trim() ? v.trim() : null),
    z.string().nullable().refine((v) => v === null || isPayMarkName(v), "شعار غير موجود في القائمة المغلقة"),
  ),
  trustItems: z.preprocess(
    (v) => (typeof v === "string" ? v.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 6) : []),
    z.array(z.string().max(60, "سطر الثقة طويل — اجعله عبارة قصيرة")),
  ),
});

/**
 * كلام صفحة البيع لسوق واحد (PAY-G13). `upsert` لا `update`: الصفّ لا يوجد حتى أوّل
 * حفظ، وإجبار خالد على «إنشاء» ثم «تعديل» خطوةٌ بلا معنى — الشاشة تعرض حقولاً فارغة
 * ويصير الحفظ الأوّل هو الإنشاء.
 */
export async function updatePaySectionContent(market: string, form: FormData) {
  await requireFinanceAdmin();
  if (!MARKETS.includes(market as (typeof MARKETS)[number])) throw new Error("سوق غير معروف");
  const parsed = paySectionSchema.safeParse({
    announcement: value(form, "announcement"), headline: value(form, "headline"),
    subheadline: value(form, "subheadline"), trustItems: form.get("trustItems"),
    vatNote: value(form, "vatNote"), installmentLabel: value(form, "installmentLabel"),
    refundNote: value(form, "refundNote"), paymentFootnote: value(form, "paymentFootnote"),
    paymentFootnoteSub: value(form, "paymentFootnoteSub"),
    teamHeadline: value(form, "teamHeadline"), teamSubheadline: value(form, "teamSubheadline"),
    payMarks: value(form, "payMarks"), installmentMark: value(form, "installmentMark"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "تحقق من كلام الصفحة");
  await db.paySectionContent.upsert({
    where: { market },
    create: { market, ...parsed.data },
    update: parsed.data,
  });
  await revalidateCatalog();
}

/** One duration policy applies to every plan — see PAY-Q3. No planId here on purpose. */
export async function addCommercialTermPolicy(form: FormData) {
  await requireFinanceAdmin();
  const paidMonths = Number(form.get("paidMonths")); const bonusServiceMonths = Number(form.get("bonusMonths"));
  if (!Number.isInteger(paidMonths) || paidMonths < 1 || !Number.isInteger(bonusServiceMonths) || bonusServiceMonths < 0) throw new Error("مدة غير صحيحة");
  await db.commercialTermPolicy.create({ data: { paidMonths, bonusServiceMonths, displayOrder: paidMonths } });
  await revalidateCatalog();
}

export async function updateCommercialTermPolicy(id: string, form: FormData) {
  await requireFinanceAdmin();
  const paidMonths = Number(form.get("paidMonths")); const bonusServiceMonths = Number(form.get("bonusMonths"));
  if (!Number.isInteger(paidMonths) || paidMonths < 1 || !Number.isInteger(bonusServiceMonths) || bonusServiceMonths < 0) throw new Error("مدة غير صحيحة");
  await db.commercialTermPolicy.update({ where: { id }, data: { paidMonths, bonusServiceMonths, displayOrder: paidMonths } });
  await revalidateCatalog();
}

/**
 * تعيين المدّة الموصى بها — الصفّ الذي تفتح عليه صفحة البيع وتوسمه «الأنسب» (PAY-G8).
 *
 * الحارس هنا لا في السكيما: مونجو لا يملك قيداً جزئياً يقول «صفّ واحد فقط بـtrue».
 * فالمسح ثم التعيين يجريان في معاملة واحدة — لأن توصيتين ليستا إشارة أقوى، بل لا إشارة.
 */
export async function setRecommendedCommercialTerm(id: string) {
  await requireFinanceAdmin();
  const target = await db.commercialTermPolicy.findUnique({ where: { id }, select: { isActive: true } });
  if (!target) throw new Error("المدة غير موجودة");
  // مدّة موقوفة لا تُوصى بها: الصفحة ستفتح على شيء لا يراه الزائر أصلاً.
  if (!target.isActive) throw new Error("لا يمكن التوصية بمدة موقوفة — فعّلها أولاً");
  await db.$transaction([
    db.commercialTermPolicy.updateMany({ where: { isRecommended: true }, data: { isRecommended: false } }),
    db.commercialTermPolicy.update({ where: { id }, data: { isRecommended: true } }),
  ]);
  await revalidateCatalog();
}

export async function deleteCommercialTermPolicy(id: string) {
  await requireFinanceAdmin();
  const activeCount = await db.commercialTermPolicy.count({ where: { isActive: true } });
  const target = await db.commercialTermPolicy.findUnique({ where: { id }, select: { isActive: true } });
  if (target?.isActive && activeCount <= 1) throw new Error("لا يمكن حذف آخر مدة نشطة — أضِف مدة بديلة أولاً");
  await db.commercialTermPolicy.delete({ where: { id } });
  await revalidateCatalog();
}

export async function createCommercialFeature(form: FormData) {
  await requireFinanceAdmin();
  const data = parseFeature(form);
  await db.commercialFeature.create({ data: { ...data, displayOrder: await db.commercialFeature.count() } });
  revalidatePath("/commercial-features");
  await revalidateCatalog();
}

export async function updateCommercialFeature(id: string, form: FormData) {
  await requireFinanceAdmin();
  await db.commercialFeature.update({ where: { id }, data: parseFeature(form) });
  revalidatePath("/commercial-features");
  await revalidateCatalog();
}

// ── Ordering (PAY-A7): what the /pay page shows first is decided here, not by creation date.
export async function moveCommercialPlan(id: string, direction: Direction) {
  await requireFinanceAdmin();
  const rows = await db.commercialPlan.findMany({ select: { id: true, displayOrder: true }, orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
  const writes = moveInList(rows, id, direction);
  if (writes.length) await db.$transaction(writes.map((w) => db.commercialPlan.update({ where: { id: w.id }, data: { displayOrder: w.displayOrder } })));
  await revalidateCatalog();
}

export async function moveCommercialFeature(id: string, direction: Direction) {
  await requireFinanceAdmin();
  const rows = await db.commercialFeature.findMany({ select: { id: true, displayOrder: true }, orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
  const writes = moveInList(rows, id, direction);
  if (writes.length) await db.$transaction(writes.map((w) => db.commercialFeature.update({ where: { id: w.id }, data: { displayOrder: w.displayOrder } })));
  revalidatePath("/commercial-features");
  await revalidateCatalog();
}

export async function moveCommercialPlanFeature(id: string, planId: string, direction: Direction) {
  await requireFinanceAdmin();
  const rows = await db.commercialPlanFeature.findMany({ where: { planId }, select: { id: true, displayOrder: true }, orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
  const writes = moveInList(rows, id, direction);
  if (writes.length) await db.$transaction(writes.map((w) => db.commercialPlanFeature.update({ where: { id: w.id }, data: { displayOrder: w.displayOrder } })));
  await revalidateCatalog(planId);
  await revalidateCatalog();
}

export async function setCommercialFeatureActive(id: string, isActive: boolean) {
  await requireFinanceAdmin();
  await db.commercialFeature.update({ where: { id }, data: { isActive } });
  revalidatePath("/commercial-features");
  await revalidateCatalog();
}

/**
 * هل تنزل هذه الميزة في الفاتورة؟ (خالد ١٣ سبتمبر ٢٠٢٦: «نعمل شيك اللي يطلع في الفاتورة»)
 *
 * لا يمسّ الفواتير الصادرة: كل طلب يجمّد التزاماته في `CheckoutOrder.planCommitments`
 * لحظة الشراء، فتبديل العلامة اليوم يغيّر ما يُطبع في الطلبات **القادمة** وحدها. وهذا
 * المقصود — مستندٌ صدر لا يُعاد كتابته.
 */
export async function setCommercialFeatureBillable(id: string, billable: boolean) {
  await requireFinanceAdmin();
  await db.commercialFeature.update({ where: { id }, data: { billable } });
  revalidatePath("/commercial-features");
  await revalidateCatalog();
}

/**
 * سطرٌ يُطبع عريضاً على البطاقة (خالد ١٤ سبتمبر ٢٠٢٦). الإبراز بالوزن لا باللون: يبقى
 * مقروءاً في الوضعين ولمن لا يميّز الألوان، ولا ينافس لون العلامة على الزرّ.
 */
export async function setCommercialFeatureHighlighted(id: string, isHighlighted: boolean) {
  await requireFinanceAdmin();
  await db.commercialFeature.update({ where: { id }, data: { isHighlighted } });
  revalidatePath("/commercial-features");
  await revalidateCatalog();
}

export async function assignCommercialFeature(planId: string, form: FormData) {
  await requireFinanceAdmin();
  const featureId = value(form, "featureId");
  const quantityText = value(form, "quantity");
  const quantity = quantityText ? Number(quantityText) : null;
  if (!featureId || (quantity !== null && (!Number.isInteger(quantity) || quantity < 0))) throw new Error("تحقق من الميزة والكمية");
  await db.commercialPlanFeature.upsert({
    where: { planId_featureId: { planId, featureId } },
    update: { quantity, note: value(form, "note") || null },
    create: { planId, featureId, quantity, note: value(form, "note") || null, displayOrder: await db.commercialPlanFeature.count({ where: { planId } }) },
  });
  await revalidateCatalog(planId);
}

export async function updateCommercialPlanFeature(id: string, planId: string, form: FormData) {
  await requireFinanceAdmin();
  const quantityText = value(form, "quantity");
  const quantity = quantityText ? Number(quantityText) : null;
  if (quantity !== null && (!Number.isInteger(quantity) || quantity < 0)) throw new Error("كمية غير صحيحة");
  await db.commercialPlanFeature.update({ where: { id }, data: { quantity, note: value(form, "note") || null } });
  await revalidateCatalog(planId);
}

export async function removeCommercialPlanFeature(id: string, planId: string) {
  await requireFinanceAdmin();
  await db.commercialPlanFeature.delete({ where: { id } });
  await revalidateCatalog(planId);
}

/** The feature library owns the simple “included in this plan” assignment. */
export async function setCommercialFeaturePlanAssignments(featureId: string, form: FormData) {
  await requireFinanceAdmin();
  const requestedPlanIds = [...new Set(form.getAll("planIds").map(String).filter(Boolean))];
  const [feature, validPlans, currentAssignments] = await Promise.all([
    db.commercialFeature.findUnique({ where: { id: featureId }, select: { id: true } }),
    db.commercialPlan.findMany({ where: { id: { in: requestedPlanIds } }, select: { id: true } }),
    db.commercialPlanFeature.findMany({ where: { featureId }, select: { id: true, planId: true } }),
  ]);
  if (!feature) throw new Error("الميزة غير موجودة");

  const selectedPlanIds = new Set(validPlans.map((plan) => plan.id));
  const assignedPlanIds = new Set(currentAssignments.map((assignment) => assignment.planId));
  const removedAssignments = currentAssignments.filter((assignment) => !selectedPlanIds.has(assignment.planId));

  await db.$transaction(async (transaction) => {
    if (removedAssignments.length > 0) {
      await transaction.commercialPlanFeature.deleteMany({ where: { id: { in: removedAssignments.map((assignment) => assignment.id) } } });
    }
    for (const planId of selectedPlanIds) {
      if (assignedPlanIds.has(planId)) continue;
      const displayOrder = await transaction.commercialPlanFeature.count({ where: { planId } });
      await transaction.commercialPlanFeature.create({ data: { planId, featureId, displayOrder } });
    }
  });

  revalidatePath("/commercial-features");
  await revalidateCatalog();
  for (const planId of new Set([...assignedPlanIds, ...selectedPlanIds])) await revalidateCatalog(planId);
}

export async function deleteCommercialPlan(id: string) {
  await requireFinanceAdmin();
  await db.commercialPlan.delete({ where: { id } });
  await revalidateCatalog();
  redirect("/commercial-plans");
}
