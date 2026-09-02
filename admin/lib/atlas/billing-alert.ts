import "server-only";

import { getAtlasReport } from "./atlas-client";
import { decideBillingAlert, type BillingAlertOutcome } from "./decide-billing-alert";

/**
 * تنبيه فاتورة أطلس على تلغرام — الجلب والإرسال؛ والقرار في `decide-billing-alert.ts`.
 *
 * لماذا وُجد (٢ سبتمبر ٢٠٢٦): فاتورة أغسطس `$9.50` فشل خصمها يوم ١ سبتمبر، وأطلس هدّد
 * بإيقاف الحساب يوم ١ أكتوبر — ولم يعلم أحد. سببان معاً: `Billing Email Address` غير
 * مضاف في أطلس فما وصل إشعاره، ولوحة الأدمن تعرض الرقم لمن يفتحها ولا تنادي أحداً.
 * اكتُشفت بالصدفة أثناء فحص اللقطات.
 *
 * ولماذا التاريخ لا المبلغ: أطلس Flex بالاستخدام ولا يقبل دفعاً سنوياً، لكنه يقفل الفترة
 * ويخصم **يوم ١ من كل شهر**. المبلغ متغيّر واليوم ثابت — فالتنبيه يُبنى على الثابت.
 *
 * يُنادى من الكرون اليوميّ القائم (`api/cron/backup`)، فلا كرون جديد ولا جدول ثانٍ يُنسى.
 */

/** يوم الشهر بتوقيت الرياض — الخادم بتوقيت UTC، وفرق الثلاث ساعات ينقل يوماً كاملاً. */
function riyadhDayOfMonth(now: Date): number {
  return Number(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", day: "2-digit" }).format(now),
  );
}

/** الجلب ثم القرار ثم الإرسال. `send` مُمرَّر كي يُشغَّل المسار بلا إرسال حقيقي. */
export async function runBillingAlert(
  now: Date,
  send: (text: string) => Promise<void>,
): Promise<BillingAlertOutcome> {
  const report = await getAtlasReport();
  // `null` تعني أن نداءات أطلس كلها سقطت (مفتاح ناقص أو IP محجوب). الصمت هنا مقصود:
  // تنبيهٌ عن تعذّر القراءة كل ليلة يدرّب المستقبِل على تجاهل القناة.
  if (!report?.billing) return { sent: false, reason: "تعذّر قراءة أطلس" };

  const outcome = decideBillingAlert(
    { ...report.billing, orgId: process.env.ATLAS_ORG_ID ?? null },
    riyadhDayOfMonth(now),
  );
  if (outcome.sent) await send(outcome.text);
  return outcome;
}
