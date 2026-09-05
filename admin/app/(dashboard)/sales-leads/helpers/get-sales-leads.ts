import "server-only";
import { PLAN_DURATIONS, priceForDuration, type PlanDuration } from "@modonty/shared/lib/pricing-durations";

import { db } from "@/lib/db";
import type { Stage } from "./funnel";

export interface SalesLeadRow {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  stage: Stage;
  lostReason: string | null;
  nextActionAt: Date | null;
  nextActionNote: string | null;
  lastContactAt: Date | null;
  expectedTier: string | null;
  expectedMonthly: number | null;
  /** مدّة العرض — بدونها لا يُعرف إجماليّه، ويصير الرقم المعروض سعر شهرٍ واحد. */
  expectedMonths: number | null;
  /** إجماليّ العرض للمدّة كلّها — هو الرقم الذي قيل للعميل، لا سعر الشهر. */
  dealTotal: number | null;
  currency: string | null;
  industryName: string | null;
  ownerName: string | null;
  countryCode: string | null;
  createdAt: Date;
  convertedClientId: string | null;
  lastNote: string | null;

  /** من أين جاء — معبّأ في **٨٥٪** من المفتوحين ولم يكن يُجلَب أصلاً. */
  source: string | null;
  /**
   * مدفوعٌ أم طبيعيّ — الحقل الصريح، لا يُشتقّ من وجود الحملة.
   *
   * الاشتقاق من `campaign` يخطئ في حالةٍ واقعية: عميلٌ من إعلانٍ لم يُكتب اسم حملته بعد
   * يُحسب «طبيعياً» فيختلّ تقرير القنوات. والعكس مستحيل: الحملة تُمسح على السيرفر متى كان
   * طبيعياً، فالحقلان متّفقان بالبناء.
   */
  isPaidAd: boolean;
  /** اسم الحملة — يُعرض تحت «مدفوع»، وهو ما يجيب «أي حملة تستحقّ ميزانيّتها». */
  campaign: string | null;
  /**
   * آخر لمسة — آخر متابعة مسجّلة، أو `lastContactAt`، أو تاريخ الإنشاء.
   *
   * السقوط إلى الإنشاء مقصود: عميلٌ سُجِّل ولم يُكلَّم قطّ **ساكتٌ منذ تسجيله**، لا «بلا بيانات».
   * وهو الحال الغالب هنا — ٩٥٪ منهم بلا متابعة واحدة.
   */
  lastTouchAt: Date;
}

const SELECT = {
  id: true,
  name: true,
  company: true,
  phone: true,
  email: true,
  stage: true,
  lostReason: true,
  nextActionAt: true,
  nextActionNote: true,
  lastContactAt: true,
  expectedTier: true,
  expectedMonthly: true,
  expectedMonths: true,
  currency: true,
  countryCode: true,
  source: true,
  isPaidAd: true,
  campaign: true,
  createdAt: true,
  convertedClientId: true,
  industry: { select: { name: true } },
  // المسؤول لا مَن سجّل: السؤال في القائمة «مين بيلاحقه؟»، وهو ما يتغيّر بالتسليم.
  owner: { select: { name: true } },
  createdBy: { select: { name: true } },
  /**
   * آخر سطر في السجلّ. صفٌّ واحد لكل عميل لا الجدول كلّه — القائمة تعرض سطراً، وجرّ التاريخ
   * كاملاً لعشرين عميلاً يقرأ مئات الصفوف لعرض عشرين سطراً.
   */
  followUps: {
    select: { body: true, channel: true, happenedAt: true },
    orderBy: { happenedAt: "desc" as const },
    take: 1,
  },
} as const;

type Raw = {
  industry: { name: string | null } | null;
  owner: { name: string | null } | null;
  createdBy: { name: string | null } | null;
  followUps: { body: string; happenedAt: Date }[];
} & Record<string, unknown>;

const shape = (l: Raw): SalesLeadRow => {
  const { industry, owner, createdBy, followUps, ...rest } = l;

  /**
   * إجماليّ العرض — بالدالّة نفسها التي حسبته بها الشاشة، لا بضربٍ مكتوبٍ هنا.
   *
   * كانت القائمة تعرض `expectedMonthly` وحده وتسمّيه «القيمة المتوقّعة»: المندوبة تقول للعميلة
   * «٢٣٬٩٩٤» ثم يقرأ التقرير «٣٬٩٩٩» — نفس الصفقة برقمين يفترقان بمقدار المدّة. والباقات لا
   * تُباع شهريّاً أصلاً؛ الشهريّ سعرُ وحدةٍ لا يُدفع وحده.
   */
  /**
   * `l` من نوع `Record<string, unknown>`، فقيمه تصل `{}` لا أرقاماً — و`tsc` أمسكها بعد ما
   * أُضيف `lastTouchAt` ووُسِّع نوع `Raw`. التحويل هنا صريحٌ عند حدّ القاعدة لا مبثوثٌ بعده.
   */
  const monthly = (l.expectedMonthly as number | null) ?? null;
  const months = (l.expectedMonths as number | null) as PlanDuration | null;
  const dealTotal =
    monthly && months && (PLAN_DURATIONS as readonly number[]).includes(months)
      ? priceForDuration(monthly, months).total
      : monthly;

  return {
    ...(rest as unknown as Omit<
      SalesLeadRow,
      "industryName" | "ownerName" | "lastNote" | "dealTotal" | "lastTouchAt"
    >),
    dealTotal,
    industryName: industry?.name ?? null,
    ownerName: owner?.name ?? createdBy?.name ?? null,
    lastNote: followUps[0]?.body ?? null,
    lastTouchAt:
      followUps[0]?.happenedAt ?? (l.lastContactAt as Date | null) ?? (l.createdAt as Date),
  };
};

const CEILING = 2000;

/** نهاية اليوم محلّياً — «مستحقّ اليوم» يشمل موعد الساعة الخامسة مساءً لا حتى منتصف الليل UTC. */
function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getSalesLeads(): Promise<{
  due: SalesLeadRow[];
  rows: SalesLeadRow[];
  total: number;
  truncated: boolean;
  byStage: Record<string, number>;
  pipelineValue: { SAR: number; EGP: number };
}> {
  const [total, all, dueRaw] = await Promise.all([
    db.salesLead.count(),
    db.salesLead.findMany({ orderBy: { createdAt: "desc" }, take: CEILING, select: SELECT }),
    /**
     * «مَن عليّا النهارده» — استعلامٌ مستقلّ لا فلترةٌ على الصفوف المقروءة: القائمة مسقوفة
     * بألفين، وموعدٌ مستحقّ خلف السقف هو بالضبط ما لا يجوز أن يضيع.
     *
     * `lte` تستبعد الغائب من نفسها: مقارنة تاريخٍ بحقلٍ غير موجود لا تطابق. فلا حاجة إلى
     * `isSet` هنا، بخلاف المقارنة بـ`null` التي تطابق الغائب في مونجو.
     */
    db.salesLead.findMany({
      where: {
        nextActionAt: { lte: endOfToday() },
        stage: { notIn: ["WON", "LOST"] },
      },
      orderBy: { nextActionAt: "asc" },
      take: 100,
      select: SELECT,
    }),
  ]);

  const rows = all.map((l) => shape(l as unknown as Raw));

  const byStage: Record<string, number> = {};
  for (const r of rows) byStage[r.stage] = (byStage[r.stage] ?? 0) + 1;

  /**
   * قيمة الفانل — المفتوح وحده.
   *
   * `WON` خارجها لأنه صار إيراداً لا احتمالاً، و`LOST` لأنه صفر. جمعُ الاثنين يعطي رقماً
   * كبيراً جميلاً لا يعني شيئاً، وهو أوّل رقمٍ يُقتبس في اجتماع.
   */
  const pipelineValue = { SAR: 0, EGP: 0 };
  for (const r of rows) {
    if (r.stage === "WON" || r.stage === "LOST") continue;
    // الإجماليّ لا الشهريّ: قيمة الفانل هي مجموع ما سيُدفع، لا مجموع أسعار الشهر الأوّل.
    if (!r.dealTotal) continue;
    const cur = r.currency === "EGP" ? "EGP" : "SAR";
    pipelineValue[cur] += r.dealTotal;
  }

  return {
    due: dueRaw.map((l) => shape(l as unknown as Raw)),
    rows,
    total,
    truncated: total > rows.length,
    byStage,
    pipelineValue,
  };
}
