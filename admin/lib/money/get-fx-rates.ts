/**
 * **أسعارُ الصرف إلى الريال السعوديّ — مصدرٌ واحد، ويوماً واحداً في الكاش.**
 *
 * المزوّد: `https://open.er-api.com/v6/latest/SAR` من exchangerate-api.com — بلا مفتاح،
 * ١٦٦ عملة، تحديثٌ يوميّ، ويقول في جسمه متى حُدِّث ومتى يُحدَّث بعدُ. مقيسٌ حيّاً
 * ١٩ سبتمبر ٢٠٢٦: `EGP 13.903584 · AED 0.979333 · USD 0.266667`.
 *
 * اختير على غيره لأنّه الوحيد بين المجّانيّات الذي يجمع الثلاثة: لا مفتاحَ يُسرَّب في
 * الكود، ويشمل الجنيهَ المصريّ (بنوكُ أوروبا المركزيّة لا تنشره، فـfrankfurter وما بُني
 * عليها يسقط)، ويعلن وقتَ تحديثه فلا نخمّن قِدَمَ الرقم. والبديلُ عند تعطّله مذكورٌ أدناه.
 *
 * ── لماذا `force-cache` صراحةً ──
 * الكاشُ في هذه النسخة **opt-in** (`node_modules/next/dist/docs/01-app/03-api-reference/
 * 04-functions/fetch.md:58`: «Caching is opt-in»). فبلا التصريح يُضرب المزوّدُ في كلّ
 * رسمةٍ للصفحة — وهو موقعٌ مجّانيّ بحدٍّ عادل، وسعرُ الصرف لا يتغيّر بين نقرتين.
 *
 * ── وما يحدث حين يسقط المزوّد ──
 * لا يُرمى خطأٌ ولا يُخمَّن رقم: تُرجَع `null` للعملة، وتقول الشاشةُ «تعذّر التحويل»
 * وتعرض المبالغ بعملاتها. رقمٌ مخترَعٌ في خانةِ إيرادٍ أسوأ من خانةٍ فارغة — الفارغةُ
 * تُسأل عنها، والمخترَعُ يُبنى عليه قرار.
 */

const ENDPOINT = "https://open.er-api.com/v6/latest/SAR";
const ONE_DAY = 86_400;

export type FxRates = {
  /** كم وحدةً من هذه العملة يساوي ريالاً واحداً — وهو ما يُقسَم عليه للتحويل إلى الريال. */
  perSar: Record<string, number>;
  fetchedAt: string | null;
  nextUpdate: string | null;
  ok: boolean;
};

export async function getFxRates(): Promise<FxRates> {
  try {
    const res = await fetch(ENDPOINT, {
      cache: "force-cache",
      next: { revalidate: ONE_DAY, tags: ["fx-rates"] },
    });
    if (!res.ok) return { perSar: {}, fetchedAt: null, nextUpdate: null, ok: false };
    const data = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
      time_last_update_utc?: string;
      time_next_update_utc?: string;
    };
    if (data.result !== "success" || !data.rates) return { perSar: {}, fetchedAt: null, nextUpdate: null, ok: false };
    return {
      perSar: data.rates,
      fetchedAt: data.time_last_update_utc ?? null,
      nextUpdate: data.time_next_update_utc ?? null,
      ok: true,
    };
  } catch {
    return { perSar: {}, fetchedAt: null, nextUpdate: null, ok: false };
  }
}

/**
 * يحوّل مبلغاً بعملته إلى الريال — بالوحدات الصغرى في الطرفين.
 *
 * `null` تعني «لا سعرَ لهذه العملة»، ولا تعني صفراً. والفرقُ بينهما هو الفرقُ بين
 * «لا نعرف» و«لا شيء»، ودمجُهما يجعل انقطاعَ الشبكة يبدو شهراً بلا مبيعات.
 */
export function toSarMinor(amountMinor: number, currency: string, rates: FxRates): number | null {
  if (currency === "SAR") return amountMinor;
  const perSar = rates.perSar[currency];
  if (!perSar || perSar <= 0) return null;
  return Math.round(amountMinor / perSar);
}
