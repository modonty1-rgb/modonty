"use server";

import { revalidatePath } from "next/cache";
import { normalizePhone } from "@modonty/shared/lib/phone";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { logAction } from "@/lib/audit/log-action";
import { recomputeSubscriptionEnd } from "@/lib/invoices/recompute-subscription-end";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

/**
 * **تفعيلُ عميلٍ من طلبٍ مدفوع** — لا «إنشاء عميل».
 *
 * الفرق ليس في التسمية: صفحةُ الإنشاء تسأل الموظّف عن الباقة والسعر والعملة والمدّة،
 * وكلّها مكتوبةٌ في الطلب أصلاً بما دفعه العميل فعلاً. فإعادةُ سؤالها تعني نسخةً ثانية
 * تتعارض مع الأولى (قاعدة المصدر الواحد — MONEY-FLOW). هذا الفعل لا يسأل عن شيءٍ منها:
 * يقرأ الطلب، ويؤسّس الكرت، ويربطهما.
 *
 * والمطلوب من الموظّف حقلان فقط: الاسمُ الظاهر والسلَج — لأنّهما وحدهما ما لا يملكه الطلب
 * (`businessName` اختياريّ، والسلَج يظهر في رابطٍ عامّ فلا يُولَّد بلا نظرة بشريّة).
 *
 * **يدويّ عن قصد**: الدفع لا يفتح حساباً بنفسه (خالد — الفلو في ACTIVATION-FLOW.html).
 * المال يصل، فيظهر الطلب في «ينتظر التفعيل»، ثمّ يفعّله موظّف.
 *
 * والرابطُ بين الطلب والعميل **لحظة** لا علاقة دائمة: بعد الكتابة لا يعود العميل يعرف
 * «من أيّ طلبٍ وُلد»، وإنّما «أيّ طلبٍ يحكمه الآن» (`activeOrderId`) — وهذا ينتقل مع كلّ
 * تجديد بينما يبقى القديم في سجلّه بسعره القديم.
 */

export type ActivateFromOrderResult =
  | { ok: true; clientId: string; slug: string }
  | { ok: false; error: string };

export async function activateFromOrder(input: { orderId: string }): Promise<ActivateFromOrderResult> {
  const session = await auth();
  if (!(session?.user as { id?: string } | undefined)?.id) return { ok: false, error: "غير مصرح" };

  const order = await db.checkoutOrder.findUnique({
    where: { id: input.orderId },
    select: {
      id: true, number: true, status: true, clientId: true,
      buyerName: true, buyerEmail: true, buyerPhone: true, businessName: true,
      planName: true, articlesPerMonth: true, salesRepId: true,
      serviceStartedAt: true, isInternal: true,
      country: true, market: true,
    },
  });
  if (!order) return { ok: false, error: "الطلب غير موجود" };

  // يُقرأ من جديدٍ هنا لا من صفّ القائمة: الصفحة قد تكون مفتوحةً منذ دقائق، وزميلٌ
  // آخر قد يكون فعّل الطلب نفسه بينهما. الفحص على القيمة المخزَّنة لا المعروضة.
  if (order.status !== "PAID") return { ok: false, error: "الطلب غير مدفوع — لا يُفعَّل" };
  if (order.clientId) return { ok: false, error: "هذا الطلب مفعَّلٌ مسبقاً" };

  // كان يرفض الطلبَ بلا `planTier` لأنّ الكرت كان يحتاج قيمةً للحقل الإلزاميّ.
  // سقط الحقل، فسقط الحارس: اسمُ الباقة (`planName`) هو ما يُقرأ في كل شاشة، وهو إلزاميّ
  // على الطلب أصلاً.

  /**
   * **الاسمُ من الطلب، والسلَجُ مؤقَّتٌ من رقمه** — ولا يُسأل الموظّفُ عن واحدٍ منهما.
   *
   * خالد (١٩ سبتمبر ٢٠٢٦): «خلّي حتى السلَق نعمله في التعديل». وموظّفُ التفعيل لا يعرف
   * العميل، فكلُّ حقلٍ يُسأل عنه تخمينٌ يُكتب في القاعدة.
   *
   * والاسمُ من `businessName` أوّلاً: هو ما يظهر على مدونتي، و`buyerName` اسمُ مَن دفع
   * وقد يكون محاسباً لا صاحبَ النشاط (`ACTIVATION-FLOW.html:515`).
   *
   * والسلَجُ مشتقٌّ من الاسم نفسِه (`slugify`)، ومعروضٌ كاملاً على صفحة التفعيل قبل
   * الضغط — فما يراه الموظّفُ هو ما يُكتب حرفاً بحرف. ويُقفل بعدها، ويُصحَّح من صفحة
   * العميل برمز تحقّق (`SlugChangeOtp` — البابُ مبنيٌّ منذ ما قبل اليوم).
   */
  const name = (order.businessName?.trim() || order.buyerName || "").trim();
  if (!name) return { ok: false, error: "الطلب بلا اسمٍ للمشتري — صحّحه قبل التفعيل" };
  const slug = slugify(name);
  if (!slug) return { ok: false, error: "تعذّر اشتقاق الرابط العامّ من الاسم — صحّح اسم المشتري على الطلب" };

  const [slugTaken, emailOwner] = await Promise.all([
    db.client.findUnique({ where: { slug }, select: { id: true } }),
    db.client.findFirst({ where: { email: order.buyerEmail }, select: { id: true, name: true } }),
  ]);
  if (slugTaken) return { ok: false, error: `السلَج ${slug} مستخدمٌ لعميلٍ آخر — راجعه يدويّاً` };
  // بريدٌ معروف = تجديدٌ لا تأسيس. الطريق الصحيح «ربط بالعميل القائم» من تفاصيل الطلب،
  // وإلّا صار للعميل الواحد كرتان وانشقّ سجلّه الماليّ بينهما.
  if (emailOwner) {
    return { ok: false, error: `هذا البريد لعميلٍ قائم (${emailOwner.name}) — اربط الطلب به من صفحة الطلب بدل تأسيس كرتٍ ثانٍ` };
  }

  /**
   * الهاتف `@unique` — وفهرسُه **ليس sparse**، فالغائب عنده قيمةٌ كغيرها.
   *
   * كان هذا الفعل يُسقط الهاتف عند التصادم ظنّاً أنّه يهرب من القيد — فيصنع مستنداً
   * ثانياً بلا هاتف، ويصطدم بأوّل عميلٍ بلا هاتف. الخطأ يخرج
   * `Unique constraint failed on clients_phone_key` — رسالةٌ لا تدلّ على السبب.
   *
   * مقيسٌ على modonty_dev ١٧ سبتمبر ٢٠٢٦:
   *   listIndexes → {"key":{"phone":1},"unique":true}   بلا sparse
   *   عملاء بلا هاتف: 1
   *
   * فالتصادم يُرفض الآن برسالةٍ تقول لمن الرقم — كما يُرفض تصادم البريد تماماً.
   */
  const phone = normalizePhone(order.buyerPhone) ?? order.buyerPhone;
  const phoneOwner = phone
    ? await db.client.findFirst({ where: { phone }, select: { id: true, name: true } })
    : null;
  if (phoneOwner) {
    return { ok: false, error: `رقم الجوال ${phone} مسجَّلٌ لعميلٍ آخر (${phoneOwner.name}) — صحّح الرقم على الطلب قبل التفعيل` };
  }

  /**
   * لحظةٌ واحدة تُكتب على الكرت وعلى الطلب معاً.
   *
   * كانت تُكتب على الكرت وحده، فيبقى `CheckoutOrder.activatedAt` فارغاً في كلّ تفعيلٍ
   * حيّ — والطلبُ هو ما تقرؤه شاشةُ الاشتراكات. فيخرج عمودُ «التفعيل» بشرطةٍ، ولا
   * يُحسب حالُ الاشتراك (ساري/منتهٍ) أصلاً، فلا يظهر العميلُ في فلتر «منتهٍ» حين
   * تنقضي مدّتُه — تجديدٌ مستحقٌّ لا يراه أحد.
   *
   * كشفه اختبارُ ١٨ سبتمبر ٢٠٢٦: فُعِّل طلبان حيّاً فخرجا
   * `order.activatedAt = null` بينما `client.activatedAt` مكتوب.
   * والترحيلُ كان يكتبه، فبدا الحقلُ سليماً ما دامت البياناتُ مرحَّلةً كلُّها.
   */
  const activatedAt = new Date();

  const client = await db.client.create({
    data: {
      name,
      slug,
      email: order.buyerEmail,
      phone,
      /**
       * **بلا كلمة مرور** (خالد ١٩ سبتمبر ٢٠٢٦: «خليه فاضي… هنعملها في التعديل»).
       *
       * كانت تُهشّ هنا من قيمةٍ افتراضيّة وتُرسَل في إيميل الترحيب. والتفعيلُ صار فتحَ
       * ملفٍّ لا تسليمَ حساب: الدخولُ يُجهَّز من صفحة العميل حين تكتمل بياناتُه. و`password`
       * اختياريٌّ في السكيما (`schema.prisma` — `password String?`) فلا يُكتب أصلاً.
       */
      // `isInternal` من الطلب لا يُسأل عنه الموظّف — حسابُنا لا يُعدّ بيعاً في التقارير.
      isInternal: order.isInternal ?? false,
      /**
       * **الدولةُ من الطلب** (خالد ١٩ سبتمبر ٢٠٢٦: «انسخ الدولة في التفعيل»).
       *
       * كانت تُترك للموظّف يكتبها في صفحة التعديل، فبقيت فارغةً عند خمسةٍ من ٤٥ عميلاً
       * (مقيسٌ على modonty_dev) — وواحدٌ خزّن «المملكة العربية السعودية» بدل `SA`، وهو
       * الانحرافُ الذي جعل `ReferralLead` ترفض الاعتماد على هذا الحقل أصلاً
       * (`schema.prisma:4155`: «حقلٌ غير نظيف»).
       *
       * وهي ليست زينةً: منها تُشتقّ جهاتُ ترخيص YMYL في الكونسول
       * (`profile-actions.ts:268`)، وتُفتح حقولُ العنوان الوطنيّ السعوديّ
       * (`profile-form.tsx:207`)، وتُطبع على صفحة العميل العامّة (`hero/utils.tsx:53`).
       *
       * ── ولماذا نسخاً لا قراءةً من الطلب ──
       * أربعةُ مستهلكين يقرأونها من صفّ العميل، اثنان منهم على مدونتي مع كلّ زيارةِ
       * صفحة — فالقراءةُ عبر `activeOrderId` تكلّف استعلاماً ثانياً لكلّ زيارة. والنسخةُ
       * لا تنحرف ما دام لها **كاتبٌ واحد**: هذا السطر. ولذلك سقط الحقلُ من نموذج التعديل
       * في نفس اليوم — الانحرافُ يأتي من تعدّد الكُتّاب لا من النسخ.
       *
       * و`market` رمزُ ISO نفسُه (SA · EG · AE) فيصلح احتياطاً بلا خريطة تحويل.
       */
      addressCountry: order.country?.trim() || order.market,
      // كلّها منسوخةٌ من الطلب — ولا واحدةٌ منها سُئل عنها الموظّف.
      // و`subscriptionTier` لم يعد يُكتب: كان هذا آخرَ كاتبٍ له في الأدمن كلّه.
      // اسمُ الباقة يُقرأ من الطلب الساري (`activeOrderId`) في كل شاشة.
      articlesPerMonth: order.articlesPerMonth,
      ...(order.salesRepId ? { salesRep: { connect: { id: order.salesRepId } } } : {}),
      subscriptionStatus: "ACTIVE",
      // سقطت كتابةُ `paymentStatus` (١٧ سبتمبر ٢٠٢٦): تُحسب من الفواتير، ولا مسارَ
      // كتب فيها «متأخّر» قطّ — فكانت تقول «مسدَّد» لكلّ عميل.
      activatedAt,
      // بدايةُ الاحتساب تتبع `serviceStartedAt` على الطلب لا يومَ التفعيل: مدّة التجهيز
      // علينا نحن. وهي فارغةٌ اليوم في أغلب الطلبات، فتبقى فارغةً حتى تُكتب هناك.
      subscriptionStartDate: order.serviceStartedAt,
      activeOrderId: order.id,
    },
    select: { id: true, name: true, slug: true },
  });

  await db.checkoutOrder.update({ where: { id: order.id }, data: { clientId: client.id, activatedAt } });

  /**
   * **لا تُحسب نهايةُ الاشتراك هنا** (خالد ١٩ سبتمبر ٢٠٢٦: «المدّة تخصّ الطلب، ما تخصّ
   * العميل»).
   *
   * المدّةُ واقعةٌ على الطلب: تفعيلُه + شهورُه. وكلُّ شاشةٍ تعرض حالَ الاشتراك تحسبه من
   * هناك (`get-subscription-standing.ts`)، فنسخُه على الكرت رقمٌ ثانٍ يشيخ أوّلَ ما
   * تُعدَّل المدّة. ومن احتاج التاريخَ محفوظاً يُعيد حسابه من الطلبات.
   */

  /**
   * **ولا يُلمَس المحتمَل** (خالد ١٩ سبتمبر ٢٠٢٦: «هذا كلُّه يخصّ المبيعات — وجدولُ
   * العملاء للعملاء الفعليّين»).
   *
   * كان التفعيلُ يختم بطاقةَ المحتمَل «مربوح» ويمسح موعدَ متابعتها. وختمُ صفقةٍ قرارُ
   * مندوبٍ يعرف مسارَها، لا أثرٌ جانبيٌّ لفتح ملفّ.
   */
  /**
   * **ولا يُرسَل بريدٌ من هنا** (خالد ١٩ سبتمبر ٢٠٢٦: «ما ترسل أيّ إيميلات من هنا —
   * هذا كلُّه نسوّيه من التعديل»).
   *
   * إيميلُ الترحيب يحمل بياناتِ دخول، ولا دخولَ بعدُ: الحسابُ بلا كلمة مرور. وإرسالُه
   * قبل اكتمال الملفّ يُدخل العميلَ على صفحةٍ ناقصة — فيُرسَل من صفحة العميل متى جهزت.
   */

  /**
   * **ونهايةُ الاشتراك تُحسب هنا بالصيغة الواحدة** (١٩ سبتمبر ٢٠٢٦، بعد اختبار الفلو).
   *
   * كان التفعيلُ يتركها فارغةً عمداً — «المدّةُ تخصّ الطلب» — وهو صحيحٌ مفهوماً وخاطئٌ
   * أثراً: أربعُ شاشاتٍ تقرأ `Client.subscriptionEndDate` ولا تعرف الطلبَ أصلاً —
   * شريحتا «Overdue» و«Renewals» في قائمة العملاء · سيجمنتاتُ المال كلُّها (شرطُها
   * `not: null`، فالحقلُ الغائبُ لا يطابق أيَّ شرط) · تنبيهاتُ الداشبورد · وشريطُ
   * الاشتراك في كونسول العميل نفسِه (`console/app/(dashboard)/layout.tsx:149-152`).
   *
   * فكان العميلُ المفعَّل من طلبه **لا تراه أيُّ شاشةٍ ماليّة**، ويرى في بوّابته
   * اشتراكاً بلا تاريخٍ ولا تقدّم. مقيسٌ على dev: عميلان كذلك، طلباهما يقولان
   * ٢٠٢٧-٠٤-١٩ و٢٠٢٨-٠٣-١٩.
   *
   * ولا يخلق هذا مصدراً ثانياً: `recomputeSubscriptionEnd` **تشتقّ** التاريخَ من
   * الطلبات المدفوعة (يوم التفعيل + الشهور + الهديّة، لأبعد طلب) ولا تقبل إدخالاً —
   * فالكرتُ ذاكرةٌ للصيغة لا رأيٌ ثانٍ. وتُستدعى في كلّ نقطةٍ تتغيّر فيها المدّة:
   * هنا · عند إصدار الفاتورة · عند ربط طلبٍ بعميل · وعند تعديل الطلب.
   */
  await recomputeSubscriptionEnd(client.id);

  await logAction("client.activate-from-order", {
    entity: "Client",
    entityId: client.id,
    summary: `${client.name} — من الطلب ${order.number}`,
    metadata: { orderId: order.id, orderNumber: order.number, slug: client.slug },
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${order.id}`);
  revalidatePath("/clients");
  revalidatePath("/");
  await revalidateModontyTag("clients");

  return { ok: true, clientId: client.id, slug: client.slug };
}
