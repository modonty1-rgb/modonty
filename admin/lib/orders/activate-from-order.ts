"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { normalizePhone } from "@modonty/shared/lib/phone";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DEFAULT_CLIENT_PASSWORD } from "@/lib/default-client-password";
import { logAction } from "@/lib/audit/log-action";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { sendClientWelcome } from "@/app/(dashboard)/clients/actions/clients-actions/send-client-welcome";

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
  | { ok: true; clientId: string; slug: string; emailSent: boolean; warning?: string }
  | { ok: false; error: string };

export async function activateFromOrder(input: {
  orderId: string;
  name: string;
  slug: string;
}): Promise<ActivateFromOrderResult> {
  const session = await auth();
  if (!(session?.user as { id?: string } | undefined)?.id) return { ok: false, error: "غير مصرح" };

  const name = input.name?.trim();
  const slug = input.slug?.trim();
  if (!name) return { ok: false, error: "اسم العميل مطلوب" };
  if (!slug) return { ok: false, error: "السلَج مطلوب" };

  const order = await db.checkoutOrder.findUnique({
    where: { id: input.orderId },
    select: {
      id: true, number: true, status: true, clientId: true,
      buyerName: true, buyerEmail: true, buyerPhone: true, businessName: true,
      planName: true, articlesPerMonth: true, salesRepId: true,
      serviceStartedAt: true, leadId: true,
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

  const [slugTaken, emailOwner] = await Promise.all([
    db.client.findUnique({ where: { slug }, select: { id: true } }),
    db.client.findFirst({ where: { email: order.buyerEmail }, select: { id: true, name: true } }),
  ]);
  if (slugTaken) return { ok: false, error: "السلَج مستخدمٌ لعميلٍ آخر" };
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

  const client = await db.client.create({
    data: {
      name,
      slug,
      email: order.buyerEmail,
      phone,
      password: await bcrypt.hash(DEFAULT_CLIENT_PASSWORD, 10),
      // كلّها منسوخةٌ من الطلب — ولا واحدةٌ منها سُئل عنها الموظّف.
      // و`subscriptionTier` لم يعد يُكتب: كان هذا آخرَ كاتبٍ له في الأدمن كلّه.
      // اسمُ الباقة يُقرأ من الطلب الساري (`activeOrderId`) في كل شاشة.
      articlesPerMonth: order.articlesPerMonth,
      ...(order.salesRepId ? { salesRep: { connect: { id: order.salesRepId } } } : {}),
      subscriptionStatus: "ACTIVE",
      paymentStatus: "PAID",
      activatedAt: new Date(),
      // بدايةُ الاحتساب تتبع `serviceStartedAt` على الطلب لا يومَ التفعيل: مدّة التجهيز
      // علينا نحن. وهي فارغةٌ اليوم في أغلب الطلبات، فتبقى فارغةً حتى تُكتب هناك.
      subscriptionStartDate: order.serviceStartedAt,
      activeOrderId: order.id,
    },
    select: { id: true, name: true, slug: true },
  });

  await db.checkoutOrder.update({ where: { id: order.id }, data: { clientId: client.id } });

  // خطُّ الرحلة يُقفل هنا: محتمَل ← طلبٌ مدفوع ← عميل. والختم بأثرٍ غير مُسقِط —
  // محتمَلٌ حُذف أو خُتم مسبقاً لا يُبطل تفعيلاً نجح.
  if (order.leadId) {
    try {
      await db.salesLead.update({
        where: { id: order.leadId },
        // `stage: WON` وحدها — و`status` يبقى كما هو. لا قيمة «CLIENT» في
        // `SalesLeadStatus` (PROSPECT · ACTIVE · ARCHIVED)، والأرشفةُ قرارُ فريقٍ لا أثرُ بيع.
        // ورثت هذه القيم من `convertLeadToClient` المحذوفة: المرحلة تُربح، والمتابعة
        // تُمسح لأنّ المحتمَل صار عميلاً فلا موعدَ اتّصالٍ بعده. و`status` يبقى ACTIVE —
        // لا قيمة «CLIENT» في `SalesLeadStatus` (PROSPECT · ACTIVE · ARCHIVED).
        data: {
          convertedClientId: client.id,
          convertedAt: new Date(),
          stage: "WON",
          status: "ACTIVE",
          nextActionAt: null,
          nextActionNote: null,
        },
      });
      revalidatePath("/sales-leads");
      revalidatePath(`/sales-leads/${order.leadId}`);
    } catch {
      // يُترك للمراجعة اليدويّة — الكرت والطلب مكتوبان وهما الأهمّ.
    }
  }

  // إيميل الترحيب **بعد** الكتابتين وبأثرٍ غير مُسقِط: فشلُ البريد لا يلغي تفعيلاً
  // نجح في قاعدة البيانات — يُبلَّغ به الموظّف ويُعاد إرساله من صفحة العميل.
  let emailSent = false;
  let warning: string | undefined;
  try {
    const r = await sendClientWelcome(client.id);
    emailSent = r.success;
    if (!r.success) warning = "فُعّل العميل، لكن إيميل الترحيب لم يُرسَل — أعِد إرساله من صفحة العميل.";
  } catch {
    warning = "فُعّل العميل، لكن إيميل الترحيب لم يُرسَل — أعِد إرساله من صفحة العميل.";
  }

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

  return { ok: true, clientId: client.id, slug: client.slug, emailSent, warning };
}
