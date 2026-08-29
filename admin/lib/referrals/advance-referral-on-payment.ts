import { db } from "@/lib/db";

/**
 * فاتورة صارت مدفوعة ⇒ الإحالة التي أنتجت هذا العميل تنتقل إلى `PAID`.
 *
 * لماذا هنا في `lib/` لا داخل مجلّد `/referrals`: يستدعيها مسار `clients/[id]/account`،
 * والاستيراد بين مسارين شقيقين ممنوع (`.claude/rules/folder-structure.md`). فما يخدم
 * اثنين يُرفَع إلى `lib/` — وهذا ثانيهما.
 *
 * **ولا تمنح المكافأة.** `PAID → REWARDED` تبقى ضغطةً بشرية في شاشة الإحالات، لأن
 * المكافأة شهرٌ مجّاني — أي مال. وحدث السداد نفسه يدويّ (موظّف يضغط «تحديد مدفوعة»
 * في `mark-paid.ts:55`، لا بوّابة دفع)، فبناء منحٍ آليّ فوق إقرارٍ يدويّ يضاعف الخطأ
 * بدل أن يقلّله. القرار لخالد — موثَّق في `documents/tasks/REFERRAL-CONTRACT.md` §٥.
 *
 * **عدم التكرار** مضمون بشرطين في نفس الاستعلام: `status: SUBSCRIBED` و`paidAt: null`.
 * فإعادة تشغيل العملية على نفس الفاتورة لا تجد صفّاً، ولا تكتب مرّتين.
 *
 * تفشل بصمت عمداً: تحديد الفاتورة مدفوعة عملٌ محاسبيّ مستقلّ، ولا يجوز أن يسقط لأن
 * صفّ إحالة تعثّر. الخطأ يُسجَّل ولا يُرفع.
 */
export async function advanceReferralOnPayment(
  clientId: string,
  invoiceId: string
): Promise<{ advanced: boolean; referralId?: string }> {
  try {
    const referral = await db.referralLead.findFirst({
      where: {
        convertedClientId: clientId,
        status: "SUBSCRIBED",
        // `paidAt: null` وحده لا يكفي على مونجو: الصفّ الذي لم يُدفع قطّ **لا يحمل الحقل
        // أصلاً**، وغيابُ حقلٍ ليس قيمةً `null`. كُتبت هكذا أوّل مرّة فسقط الاختبار الحيّ —
        // الفاتورة صارت مدفوعة والإحالة بقيت `SUBSCRIBED`. الشرطان معاً يغطّيان الحالتين:
        // صفٌّ قديم كُتب فيه `null` صراحةً، وصفٌّ جديد لا يحمل الحقل.
        OR: [{ paidAt: null }, { paidAt: { isSet: false } }],
      },
      select: { id: true },
    });
    if (!referral) return { advanced: false };

    await db.referralLead.update({
      where: { id: referral.id },
      data: { status: "PAID", paidAt: new Date(), paidInvoiceId: invoiceId },
    });
    return { advanced: true, referralId: referral.id };
  } catch (error) {
    console.error("[advanceReferralOnPayment] failed:", error);
    return { advanced: false };
  }
}
