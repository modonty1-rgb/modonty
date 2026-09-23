import "server-only";

import { db } from "@/lib/db";
import { getMarketCatalog } from "@modonty/shared/lib/commercial/get-market-catalog";

export interface PlaybookCatalogCopy {
  /** عرضُ السنة من صفّ مدّة الـ١٢ شهراً — `null` إن لم يكن معروضاً للبيع. */
  annual: { paid: number; total: number } | null;
  /** حصّةُ المقالات من الباقات المنشورة — «من ٨ إلى ١٦…» أو رقمٌ واحد، و`null` حين لا حصّة. */
  articles: string | null;
}

/**
 * **أرقامُ دليل الفريق من كتالوج البيع** (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد).
 *
 * كان الدليلُ يكتب «ادفع 12 شهر، استلم 18 شهر» و«8 مقالات شهرياً» بيده — والمندوبُ يقولها
 * للعميل. والـ٨ حصّةُ «الانطلاقة» وحدها (الزخم ١٢ · الريادة ١٦)، وعرضُ السنة صفٌّ في
 * `CommercialTermPolicy` يتغيّر من الأدمن. فتُقرأ من الكتالوج نفسِه الذي تبيع منه صفحةُ الدفع،
 * وغيابُها يُقال بجملةٍ بلا رقم — لا برقمٍ قديم.
 */
export async function getPlaybookCatalogCopy(): Promise<PlaybookCatalogCopy> {
  const catalog = await getMarketCatalog(db, "SA");
  const annualTerm = catalog.terms.find((t) => t.paidMonths === 12) ?? null;
  const quotas = catalog.plans.map((p) => p.articlesPerMonth).filter((n): n is number => n != null && n > 0);
  const min = Math.min(...quotas);
  const max = Math.max(...quotas);

  return {
    annual: annualTerm ? { paid: annualTerm.paidMonths, total: annualTerm.paidMonths + annualTerm.bonusServiceMonths } : null,
    articles: !quotas.length ? null : min === max ? `${min} مقالات شهرياً` : `من ${min} إلى ${max} مقالاً شهرياً حسب الباقة`,
  };
}
