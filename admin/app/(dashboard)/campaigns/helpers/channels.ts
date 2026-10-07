import type { AdChannel, AdObjective, AdSite } from "@prisma/client";

/**
 * مواقعنا وأصولها — الوجهة التي يوصّل إليها الإعلان.
 *
 * الأصل مكتوبٌ هنا لا في خانةٍ يملؤها المستخدم: حرفٌ ناقصٌ في نطاقٍ يعني إعلاناً مدفوعاً
 * يوصّل إلى صفحة خطأ. و`www` مقصودة في الاثنين — جبر سيو يطبّع الأبكس إليها في
 * `lib/seo-meta.ts:97`، ومدونتي كذلك.
 */
const SITES: { code: AdSite; label: string; base: string }[] = [
  { code: "MODONTY", label: "مدونتي", base: "https://www.modonty.com/" },
  { code: "JBRSEO", label: "جبر سيو", base: "https://www.jbrseo.com/" },
];

const siteOf = (code: AdSite) => SITES.find((s) => s.code === code) ?? SITES[0];

/**
 * القنوات والأسواق — كلّ ما يحتاجه الكود ليرسم حملةً ويصل رابطها.
 *
 * في الكود لا في القاعدة، بخلاف `LeadSourceOption`: هذه القيم **تقود سلوكاً** — منها يُشتقّ
 * `utm_source`، وبها يُرتَّب المنسدل. صفٌّ يضيفه المستخدم بلا وسمٍ يقابله يُخرج رابطاً ناقص
 * المفتاح، فيصل زائرٌ لا يُعرف من أين جاء.
 */

/** ما يُكتب في `utm_source` — الاسم الذي تعرفه المنصّة عن نفسها، لا ترجمتنا العربية. */
const CHANNEL_UTM: Record<AdChannel, string> = {
  TIKTOK: "tiktok",
  YOUTUBE: "youtube",
  SNAPCHAT: "snapchat",
  INSTAGRAM: "instagram",
  FACEBOOK: "facebook",
  TWITTER: "twitter",
  LINKEDIN: "linkedin",
  GOOGLE: "google",
};

/**
 * القنوات **القويّة** لكلّ سوق وحدها، مرتّبةً بالوصول (خالد ٢٩ سبتمبر ٢٠٢٦: «لما أختار البلد تعرض
 * لي بس المنصّات القويّة»). وبحث جوجل آخر كلّ قائمة: بحثٌ لا شبكة، فلا يُقاس بمقياسها.
 *
 * مقيس — DataReportal Digital 2026 (أكتوبر ٢٠٢٥)، الوصول الإعلانيّ بالمليون ونسبته من السكان:
 * السعودية — تيك توك ٣٨٫٦* · يوتيوب ٢٧٫٥ (٧٩٪) · سناب ٢٥٫٣ (٧٣٪) · انستقرام ١٨٫٢ (٥٢٪) · فيسبوك ١٧٫٧ (٥١٪)
 *             — خارجها: إكس ١٥٫٠ (٤٣٪) · لينكدإن ١٢٫٠**
 * مصر      — فيسبوك ٥١٫٦ (٤٣٪) · يوتيوب ٤٩٫٣ (٤٢٪) · تيك توك ٤٨٫٨* · انستقرام ٢١٫٧ (١٨٪)
 *             — خارجها: سناب ٢٠٫٦ (١٧٪) · لينكدإن ١٥٫٠** · إكس ٤٫٦٤ (٤٪)
 * الإمارات — تيك توك ١٢٫٥* · فيسبوك ٩٫٧٠ (٨٥٪) · يوتيوب ٨٫٣٧ (٧٣٪) · انستقرام ٨٫٠٥ (٧١٪) · لينكدإن ١٠٫٠**
 *             — خارجها: سناب ٥٫١٣ (٤٥٪) · إكس ٢٫٨٥ (٢٥٪)
 * الكويت   — تيك توك ٤٫٤٤* · يوتيوب ٣٫٣١ (٦٦٪) · انستقرام ٣٫٠٠ (٥٩٪) · فيسبوك ٢٫٤٥ (٤٩٪) · سناب ٢٫٤٣ (٤٨٪)
 *             — خارجها: إكس ١٫٤٢ (٢٨٪) · لينكدإن ١٫٣٠**
 * * تيك توك للبالغين وحدهم، ويتجاوز عددَهم (١١٢–١٥٤٪) — فلا يُقارن بغيره حرفياً.
 * ** لينكدإن أعضاءٌ مسجّلون لا نشطون؛ يبقى في الإمارات لأن جمهورنا شركات.
 *
 * حملةٌ قديمة على قناةٍ خرجت من القائمة تبقى تُعرض باسمها — القائمة للاختيار الجديد لا للقراءة.
 */
const CHANNELS_BY_MARKET: Record<string, AdChannel[]> = {
  SA: ["TIKTOK", "YOUTUBE", "SNAPCHAT", "INSTAGRAM", "FACEBOOK", "GOOGLE"],
  EG: ["FACEBOOK", "YOUTUBE", "TIKTOK", "INSTAGRAM", "GOOGLE"],
  AE: ["TIKTOK", "FACEBOOK", "YOUTUBE", "INSTAGRAM", "LINKEDIN", "GOOGLE"],
  KW: ["TIKTOK", "YOUTUBE", "INSTAGRAM", "FACEBOOK", "SNAPCHAT", "GOOGLE"],
};

/**
 * الأنسب لكلّ هدف — القناة تُختار بالهدف لا بحجم الجمهور وحده (خالد ٢٩ سبتمبر ٢٠٢٦: «انت بتخمّن…
 * شوف أفضل الممارسات»). من تقارير وكالات الأداء في الخليج ومصر (تقديراتٌ لا قياسٌ رسميّ):
 *  • جلب العملاء والمبيعات: بحث جوجل لمن يبحث بنفسه، وميتا لنماذج العملاء وإعادة الاستهداف،
 *    ولينكدإن لأصحاب القرار في الشركات (أغلى وأدقّ). سناب وتيك توك جمهورهما مستهلكون أكثر.
 *  • الوعي والتفاعل: تيك توك وسناب ويوتيوب للانتشار — ويُقصر هنا على قويّ السوق.
 *  • الزيارات: جوجل وميتا.
 * لا تُخفى قناة: الأنسب أوّلاً، والباقي «قنوات أخرى» — القرار الأخير للميديا باير.
 */
const BEST_FOR: Record<AdObjective, AdChannel[]> = {
  LEADS: ["GOOGLE", "FACEBOOK", "INSTAGRAM", "LINKEDIN"],
  SALES: ["GOOGLE", "FACEBOOK", "INSTAGRAM", "LINKEDIN"],
  TRAFFIC: ["GOOGLE", "FACEBOOK", "INSTAGRAM"],
  AWARENESS: ["TIKTOK", "SNAPCHAT", "YOUTUBE", "INSTAGRAM", "FACEBOOK"],
  ENGAGEMENT: ["TIKTOK", "SNAPCHAT", "INSTAGRAM", "YOUTUBE", "FACEBOOK"],
};
const REACH_OBJECTIVES = new Set<AdObjective>(["AWARENESS", "ENGAGEMENT"]);
const ALL_CHANNELS: AdChannel[] = ["GOOGLE", "FACEBOOK", "INSTAGRAM", "LINKEDIN", "TIKTOK", "SNAPCHAT", "YOUTUBE", "TWITTER"];

/**
 * قنوات الهدف في السوق: `best` مرتّبةً بالهدف (وللوعي والتفاعل مقصورةً على قويّ السوق — سناب
 * ضعيفٌ في مصر)، و`other` بقيّة القنوات كلّها. بلا هدفٍ بعد: قنوات السوق بترتيب الوصول.
 */
export function channelsFor(market: string, objective: AdObjective | ""): { best: AdChannel[]; other: AdChannel[] } {
  const strong = CHANNELS_BY_MARKET[market] ?? CHANNELS_BY_MARKET.SA;
  const best = objective
    ? BEST_FOR[objective].filter((c) => !REACH_OBJECTIVES.has(objective) || strong.includes(c))
    : strong;
  return { best, other: ALL_CHANNELS.filter((c) => !best.includes(c)) };
}

export const OBJECTIVE_LABEL: Record<AdObjective, string> = {
  LEADS: "عملاء محتملون",
  SALES: "مبيعات",
  TRAFFIC: "زيارات",
  ENGAGEMENT: "تفاعل",
  AWARENESS: "وعي",
};

interface MarketMeta {
  code: string;
  label: string;
  currency: string;
  currencyName: string;
}

/**
 * الأسواق وعملاتها.
 *
 * والضريبة خارج هذه المرحلة بقرار خالد (٥ سبتمبر): المبلغ المسجَّل هو المكتوب كما هو. المقاسُ
 * حينها — ميتا تضيفها بسعر البلد إن لم يكن الرقم الضريبيّ على الحساب — محفوظٌ في
 * `documents/idea/CAMPAIGNS.html` إن رجعنا إليها.
 */
export const MARKETS: MarketMeta[] = [
  { code: "SA", label: "السعودية", currency: "SAR", currencyName: "بالريال السعودي" },
  { code: "EG", label: "مصر", currency: "EGP", currencyName: "بالجنيه المصري" },
  // خالد ٢٩ سبتمبر ٢٠٢٦: «ضيفهم».
  { code: "AE", label: "الإمارات", currency: "AED", currencyName: "بالدرهم الإماراتي" },
  { code: "KW", label: "الكويت", currency: "KWD", currencyName: "بالدينار الكويتي" },
];

export const marketOf = (code: string): MarketMeta =>
  MARKETS.find((m) => m.code === code) ?? MARKETS[0];

/**
 * المسار يُنظَّف قبل أن يُلصق بالأصل.
 *
 * ثلاث كتاباتٍ متوقّعة لنفس الشيء: `pricing` و`/pricing` و`https://www.modonty.com/pricing`.
 * والأصل ينتهي بشرطةٍ مائلة، فلصقُ `/pricing` كما هو يعطي `//pricing`. والرابط الكامل يجعل
 * النطاق مكتوباً مرّتين — ونطاقُ حملةٍ وجهتُها جبر سيو قد يُكتب `modonty.com` فيصبّ الإعلان
 * في غير موضعه، وهو عطلٌ لا يظهر إلا بعد أن تُصرف الفلوس.
 */
function normalizeLandingPath(path?: string | null): string {
  const p = (path ?? "").trim();
  if (!p) return "";
  return p
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\/+/, "")
    .replace(/\?.*$/, "");
}

/**
 * الرابط الموسوم — مفتاحان لا واحد.
 *
 * `utm_campaign` ينسب **العميل** إلينا، و`utm_id` يجلب **المصروف**: جوجل تعرّفه حرفياً بأنه
 * «معرّف الحملة — استخدم نفس المعرّفات التي ترفع بها بيانات الحملة»
 * (`support.google.com/analytics/answer/10917952`). وبلا معرّف المنصّة يخرج الرابط ناقصاً
 * مفتاحه الثاني بدل أن يحمل قيمةً مخترَعة.
 */
export function trackedUrl(input: {
  channel: AdChannel;
  utmCampaign: string;
  platformCampaignId?: string | null;
  /** وجهة الإعلان — كان الأصل ثابتاً على مدونتي، فحملةُ جبر سيو تُنتج رابطاً للموقع الخطأ. */
  site: AdSite;
  /** صفحة الهبوط داخل الموقع (`/pricing`) — بلا مسارٍ يهبط الإعلان على الرئيسية. */
  landingPath?: string | null;
}): string {
  const base = siteOf(input.site).base + normalizeLandingPath(input.landingPath);
  const q = new URLSearchParams({
    utm_source: CHANNEL_UTM[input.channel],
    utm_medium: "cpc",
    utm_campaign: input.utmCampaign,
  });
  if (input.platformCampaignId?.trim()) q.set("utm_id", input.platformCampaignId.trim());
  return `${base}?${q.toString()}`;
}
