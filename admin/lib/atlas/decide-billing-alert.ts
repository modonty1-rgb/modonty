// القرار وحده — بلا شبكة ولا وقت ولا `server-only`، فيُشغَّل مباشرةً بـ`node` ويُثبَت
// نصّه قبل أن يصل تلغرام. الجلب والإرسال في `billing-alert.ts`.

/** يوم التنبيه الاستباقي — قبل الخصم بأسبوع تقريباً. */
const PRE_CHARGE_DAY = 24;

/** أيام ما بعد الخصم التي يُفحص فيها نجاحه. الثلاثة لأن أطلس قد يتأخّر في تحديث الحالة. */
const POST_CHARGE_DAYS = new Set([2, 3, 5]);

/** حالة أطلس الرسمية لفشل الخصم — «charge for that amount failed». */
const FAILED = "FAILED";

/** رابط لوحة الفوترة. يُبنى بمعرّف المنظمة لأن الرابط بلا معرّف يفتح صفحةً لا تخصّنا —
 *  ورابطٌ لا يوصل في تنبيهٍ عاجل يساوي غيابه. */
function billingUrl(orgId?: string | null): string {
  return orgId
    ? `https://cloud.mongodb.com/v2#/org/${orgId}/billing/overview`
    : "https://cloud.mongodb.com/v2#/preferences/organizations";
}

export type BillingAlertOutcome =
  | { sent: false; reason: "لا يوم تنبيه" | "تعذّر قراءة أطلس" | "الخصم ناجح" }
  | { sent: true; kind: "failed" | "pre-charge"; text: string };

function usd(n: number): string {
  return `$${n.toFixed(2)}`;
}

/** ما يحتاجه القرار من التقرير — مفصولٌ عن `AtlasReport` كي يُختبَر القرار بأرقام مكتوبة. */
export interface BillingFacts {
  /** معرّف المنظمة في أطلس — لبناء رابط يفتح لوحة الفوترة مباشرةً. */
  orgId?: string | null;
  pendingUsd: number;
  periodStart: string;
  periodEnd: string;
  history: Array<{ start: string; end: string; status: string; usd: number }>;
}

/**
 * القرار وحده — دالّة نقيّة، بلا شبكة ولا وقت ولا إرسال.
 *
 * فُصلت عن الجلب لأن مفاتيح أطلس أسرارٌ في بيئة الإنتاج لا تُسحب إلى الجهاز (مقيس ٢
 * سبتمبر: `13 Secret values cannot be pulled`)، فالطريق الوحيد لإثبات المنطق قبل الدفع
 * هو تشغيله على أرقام حقيقية منسوخة من لوحة أطلس. الجلب يبقى بلا اختبار — لأنه سطر نداء.
 *
 * الفشل يُفحص **كل يوم** لا في أيامه وحدها: فاتورة مرفوضة تبقى مرفوضة، والتكرار اليوميّ
 * هو المقصود — خالد: «كل شوي أنا حأقول أفتكر؟». إزعاجٌ متعمَّد، بديله إيقاف قاعدة الإنتاج.
 */
export function decideBillingAlert(facts: BillingFacts, dayOfMonth: number): BillingAlertOutcome {
  const failed = facts.history.find((i) => i.status.toUpperCase() === FAILED);

  if (failed) {
    return {
      sent: true,
      kind: "failed",
      text: [
        "🔴🔴 <b>فاتورة أطلس ما انخصمت</b>",
        `💳 المبلغ: <b>${usd(failed.usd)}</b> — فترة ${failed.start.slice(0, 10)} ← ${failed.end.slice(0, 10)}`,
        "⚠️ أطلس يوقف الحساب لو ما اندفعت — وقاعدة الإنتاج كلها عليه.",
        "🏦 البطاقة نفسها سليمة غالباً؛ الرفض من البنك (رصيد · حدّ دولي · تحقّق).",
        `🔗 Billing → Payment Method: ${billingUrl(facts.orgId)}`,
      ].join("\n"),
    };
  }

  if (dayOfMonth === PRE_CHARGE_DAY) {
    return {
      sent: true,
      kind: "pre-charge",
      text: [
        "🗓️ <b>فاتورة أطلس تُخصم يوم ١</b>",
        `📊 المستهلك حتى الآن: <b>${usd(facts.pendingUsd)}</b>`,
        `📅 الفترة: ${facts.periodStart.slice(0, 10)} ← ${facts.periodEnd.slice(0, 10)}`,
        "✅ تأكّد إن البطاقة شغّالة قبل يوم ١.",
        `🔗 ${billingUrl(facts.orgId)}`,
      ].join("\n"),
    };
  }

  return { sent: false, reason: POST_CHARGE_DAYS.has(dayOfMonth) ? "الخصم ناجح" : "لا يوم تنبيه" };
}
