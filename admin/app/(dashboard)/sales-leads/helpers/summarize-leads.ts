import { SILENT_AFTER_DAYS, describeSilence } from "./describe-silence";
import { describeDue, type Stage } from "./funnel";
import { NO_MARKET } from "./markets";
import type { SalesLeadRow } from "./get-sales-leads";

export interface LeadsSummary {
  /** موعدٌ فات ولم يُغلق — الوحيد الذي فيه ضررٌ واقع. */
  overdue: number;
  /** موعد اليوم — شغل اليوم نفسه. */
  today: number;
  /** خلال السبعة القادمة — يُعرف حجم الأسبوع قبل أن يبدأ. */
  soon: number;
  /**
   * مفتوحٌ بلا موعد قادم — أخطر رقم في الشاشة.
   *
   * ليس فراغَ حقل: عميلٌ مفتوحٌ بلا موعد لا أحد يرجع له، فهو خسارةٌ لم تُسجَّل بعد. مقيس على
   * الصفوف الحالية: **١٩ من ٢٠** — أي أن الفانل ميّتٌ عملياً والشاشة لا تقول ذلك.
   */
  noDate: number;
  /**
   * ساكتٌ منذ ثلاثين يوماً فأكثر — أصدق رقمٍ عن صحّة الفانل.
   *
   * مقيس على الصفوف الحالية: **١٧ من ٢٠**، ووسيط العمر ٦٥ يوماً. عميلٌ لم يُكلَّم شهراً ليس
   * «مفتوحاً» إلا في الجدول.
   */
  silent: number;
  /** المفتوح كلّه — مقام النِّسب أعلاه. */
  open: number;
  /** توزيع المراحل — القائمة كلّها، مغلقُها ومفتوحُها. */
  byStage: Record<string, number>;
  /**
   * توزيع المصادر على **المفتوحين** — مفتاحه قيمة `source`، و`NO_SOURCE` لمن بلا مصدر.
   *
   * ومَن بلا مصدر ليس صفّاً يُهمَل: هو ثغرةٌ في الإسناد تُقاس (٣ من ٢٠ اليوم)، فله توجل يفتحه.
   */
  bySource: Record<string, number>;
  /** توزيع السوقين على المفتوحين — و`NO_MARKET` لمن بلا سوق (٢ من ٢٠، مقيس). */
  byMarket: Record<string, number>;
  /** قيمة المفتوح بعملتيه — `WON` إيرادٌ لا احتمال، و`LOST` صفر. */
  pipeline: { SAR: number; EGP: number };
}

const CLOSED: readonly Stage[] = ["WON", "LOST"];

/** مفتاح «بلا مصدر» — علامةُ شاشةٍ لا قيمةٌ في القاعدة، فلا تُشبه أي مصدرٍ حقيقيّ. */
export const NO_SOURCE = "__none__";

/**
 * الأرقام التي تُقرأ قبل أي صفّ — محسوبةٌ من الصفوف المقروءة أصلاً، بلا استعلامٍ إضافي.
 *
 * وكلّها **قابلة للضغط** في الشاشة: رقمٌ لا يفتح شيئاً يُقرأ ثم يُنسى، ورقمٌ يفلتر الجدول تحته
 * يصير أوّل خطوة في الشغل.
 */
export function summarizeLeads(rows: SalesLeadRow[]): LeadsSummary {
  const s: LeadsSummary = {
    overdue: 0, today: 0, soon: 0, noDate: 0, silent: 0, open: 0,
    byStage: {},
    bySource: {},
    byMarket: {},
    pipeline: { SAR: 0, EGP: 0 },
  };

  for (const r of rows) {
    s.byStage[r.stage] = (s.byStage[r.stage] ?? 0) + 1;
    if (CLOSED.includes(r.stage)) continue;

    s.open += 1;
    const src = r.source || NO_SOURCE;
    s.bySource[src] = (s.bySource[src] ?? 0) + 1;

    const mkt = r.countryCode || NO_MARKET;
    s.byMarket[mkt] = (s.byMarket[mkt] ?? 0) + 1;
    if (r.dealTotal) s.pipeline[r.currency === "EGP" ? "EGP" : "SAR"] += r.dealTotal;

    // نفس الدالّتين اللتين تكتبان النصّ في الصفّ — فلا يقول العدّاد شيئاً ويقول الصفّ غيره.
    const silence = describeSilence(r.lastTouchAt);
    if (silence.days !== null && silence.days >= SILENT_AFTER_DAYS) s.silent += 1;

    const tone = describeDue(r.nextActionAt).tone;
    if (tone === "overdue") s.overdue += 1;
    else if (tone === "today") s.today += 1;
    else if (tone === "soon") s.soon += 1;
    else if (tone === "none") s.noDate += 1;
  }

  return s;
}
