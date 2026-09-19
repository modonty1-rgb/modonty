import { db } from "@/lib/db";
import { getFxRates, toSarMinor } from "@/lib/money/get-fx-rates";

/**
 * **رقمان لكلّ شهر — ما دخل، وما استُحقّ.** موحَّدان بالريال، من أوّل عميلٍ حتّى اليوم.
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «تبدأ مع أوّل عميل دخل عندنا… أبغى أعرف كلّ شهر كم المفروض
 * عندي من فلوس، وكم عندي من إيراد».
 *
 * -- الفرقُ بين الرقمين، وهو جوهرُ البطاقة --
 *
 * **النقديّ** (`cash`) — ما وصل الخزينةَ في ذلك الشهر، كاملاً في شهر `paidAt`. يجيب
 * «كم قبضنا».
 *
 * **المستحقّ** (`accrued`) — ثمنُ الخدمة المقدَّمة في ذلك الشهر وحده. باقةُ الزخم اثني
 * عشر شهراً تُقسَم على اثني عشر، فيقع كلُّ جزءٍ في شهره. يجيب «كم عملنا».
 *
 * ومقيسٌ على `modonty_dev` ١٩ سبتمبر ٢٠٢٦ أنّ الفرق ليس هامشيّاً: سبتمبر نقديُّه
 * `43,031` ومستحقُّه `12,397` — لأنّ أربعين طلباً من اثنين وسبعين مدّتُها سنة. فالنقديُّ
 * وحده يجعل شهرَ التحصيل يبدو انفجاراً وما بعده جدباً، وكلاهما وهم.
 *
 * -- وثلاثة قرارات تغيّر الرقم --
 *
 * **١ · المستحقُّ يبدأ من بدء الخدمة** (`serviceStartedAt`) لا من الدفع — والخدمةُ هي
 * ما يُستحقّ عليه. وتسعةُ طلباتٍ من اثنين وسبعين بلا تاريخِ بدءٍ فترجع إلى `paidAt`،
 * وهو أقربُ ما يُعرف عنها ولا يُخمَّن غيرُه.
 *
 * **٢ · الأشهرُ المجّانيّة تدخل القسمة**: اثنا عشرَ مدفوعاً وشهرانِ هديّةً تُقسَم على
 * أربعةَ عشر — لأنّنا نخدمه أربعةَ عشر شهراً، والهديّةُ خصمٌ على السعر لا خدمةٌ بلا كلفة.
 *
 * **٣ · التحويلُ بسعر اليوم** (بنصّ طلبه: «حسب آخر سعر تحويل»)، فالرقم يقول «كم تساوي
 * اليوم» لا «كم دخل الخزينةَ يومَها».
 *
 * وما استُحقَّ بعد الشهر الجاري لا يُعرض خانةً — يُجمع في `deferredSarMinor`: مالٌ قُبض
 * وخدمتُه لم تُقدَّم بعد، وهو التزامٌ علينا لا إيرادٌ لنا.
 */
export type MonthRevenue = {
  /** `YYYY-MM` — مفتاحُ ترتيبٍ، والعرضُ يشتقّ اسمَه منه. */
  key: string;
  label: string;
  year: number;
  /** ما وصل الخزينة في هذا الشهر. */
  cashSarMinor: number;
  /** ثمنُ الخدمة المقدَّمة في هذا الشهر. */
  accruedSarMinor: number;
  /** طلباتٌ قُبض مالُها في هذا الشهر. */
  orders: number;
};

export type MonthlyRevenue = {
  months: MonthRevenue[];
  totalCashSarMinor: number;
  totalAccruedSarMinor: number;
  /** مستحقُّ ما بعد الشهر الجاري — مقبوضٌ وخدمتُه لم تُقدَّم. */
  deferredSarMinor: number;
  fx: { ok: boolean; fetchedAt: string | null; egp: number | null; aed: number | null };
  /** عملاتٌ بلا سعرِ صرف — تُذكر ولا تُجمع بصفر. */
  unconverted: string[];
};

const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export async function getMonthlyRevenue(now = new Date()): Promise<MonthlyRevenue> {
  const [rows, fx] = await Promise.all([
    db.checkoutOrder.findMany({
      where: { status: "PAID" },
      select: {
        paidAt: true, serviceStartedAt: true, activatedAt: true,
        totalMinor: true, currency: true, paidMonths: true, bonusServiceMonths: true,
      },
      take: 5000,
    }),
    getFxRates(),
  ]);

  const cash = new Map<string, number>();
  const accrued = new Map<string, number>();
  const counts = new Map<string, number>();
  const unconverted = new Set<string>();
  let earliest: Date | null = null;
  let deferredSarMinor = 0;
  const currentKey = monthKey(now);

  for (const r of rows) {
    const sar = toSarMinor(r.totalMinor, r.currency, fx);
    if (sar === null) {
      unconverted.add(r.currency);
      continue;
    }

    const paidAt = r.paidAt ?? r.serviceStartedAt ?? r.activatedAt;
    if (paidAt) {
      const k = monthKey(paidAt);
      cash.set(k, (cash.get(k) ?? 0) + sar);
      counts.set(k, (counts.get(k) ?? 0) + 1);
      if (!earliest || paidAt < earliest) earliest = paidAt;
    }

    const start = r.serviceStartedAt ?? r.paidAt ?? r.activatedAt;
    if (!start) continue;
    if (!earliest || start < earliest) earliest = start;
    const span = Math.max(1, r.paidMonths + r.bonusServiceMonths);
    const per = Math.round(sar / span);
    for (let i = 0; i < span; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const k = monthKey(d);
      if (k > currentKey) deferredSarMinor += per;
      else accrued.set(k, (accrued.get(k) ?? 0) + per);
    }
  }

  const months: MonthRevenue[] = [];
  if (earliest) {
    const cursor = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth(), 1);
    while (cursor <= last) {
      const k = monthKey(cursor);
      months.push({
        key: k,
        label: AR_MONTHS[cursor.getMonth()],
        year: cursor.getFullYear(),
        cashSarMinor: cash.get(k) ?? 0,
        accruedSarMinor: accrued.get(k) ?? 0,
        orders: counts.get(k) ?? 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  return {
    months,
    totalCashSarMinor: months.reduce((s, m) => s + m.cashSarMinor, 0),
    totalAccruedSarMinor: months.reduce((s, m) => s + m.accruedSarMinor, 0),
    deferredSarMinor,
    fx: { ok: fx.ok, fetchedAt: fx.fetchedAt, egp: fx.perSar.EGP ?? null, aed: fx.perSar.AED ?? null },
    unconverted: [...unconverted],
  };
}
