import type { AdCampaignStatus, AdChannel, AdObjective, AdSite } from "@prisma/client";

/**
 * مواقعنا وأصولها — الوجهة التي يوصّل إليها الإعلان.
 *
 * الأصل مكتوبٌ هنا لا في خانةٍ يملؤها المستخدم: حرفٌ ناقصٌ في نطاقٍ يعني إعلاناً مدفوعاً
 * يوصّل إلى صفحة خطأ. و`www` مقصودة في الاثنين — جبر سيو يطبّع الأبكس إليها في
 * `lib/seo-meta.ts:97`، ومدونتي كذلك.
 */
export const SITES: { code: AdSite; label: string; base: string }[] = [
  { code: "MODONTY", label: "مدونتي", base: "https://www.modonty.com/" },
  { code: "JBRSEO", label: "جبر سيو", base: "https://www.jbrseo.com/" },
];

export const siteOf = (code: AdSite) => SITES.find((s) => s.code === code) ?? SITES[0];

/**
 * القنوات والأسواق — كلّ ما يحتاجه الكود ليرسم حملةً ويصل رابطها.
 *
 * في الكود لا في القاعدة، بخلاف `LeadSourceOption`: هذه القيم **تقود سلوكاً** — منها يُشتقّ
 * `utm_source`، وبها يُرتَّب المنسدل. صفٌّ يضيفه المستخدم بلا وسمٍ يقابله يُخرج رابطاً ناقص
 * المفتاح، فيصل زائرٌ لا يُعرف من أين جاء.
 */

/** ما يُكتب في `utm_source` — الاسم الذي تعرفه المنصّة عن نفسها، لا ترجمتنا العربية. */
export const CHANNEL_UTM: Record<AdChannel, string> = {
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
 * ترتيب المنسدل يتبع السوق — والفرق بين السوقين يقلب القائمة لا يزحزحها.
 *
 * مقيس (DataReportal، رقمنة ٢٠٢٥، الوصول الإعلانيّ بالمليون):
 * السعودية — تيك توك ٣٤٫١ · يوتيوب ٢٧٫٢ · سناب ٢٤٫٧ · انستقرام ١٦٫٩ · فيسبوك ١٦٫٤ · إكس ١٥٫٧ · لينكدإن ١١٫٠
 * مصر — يوتيوب ٥٠٫٧ · فيسبوك ٤٨٫٧ · تيك توك ٤١٫٣ · انستقرام ٢٠٫١ · سناب ١٩٫٧ · لينكدإن ١٣٫٠ · إكس ٥٫٢
 *
 * سناب ثالثُ السعودية (٨٧٫٧٪ من البالغين) وخامسُ مصر، وإكس ثلاثة أضعافه هناك عنه هنا. فقائمةٌ
 * ثابتة الترتيب تدفع مشتري الإعلانات إلى القناة الخطأ في أحد السوقين حتماً.
 *
 * وجوجل آخر القائمتين لا بترتيبٍ مقيس: بحثٌ لا شبكةٌ اجتماعية، فلا يقاس بمقياسها.
 */
export const CHANNELS_BY_MARKET: Record<string, AdChannel[]> = {
  SA: ["TIKTOK", "YOUTUBE", "SNAPCHAT", "INSTAGRAM", "FACEBOOK", "TWITTER", "LINKEDIN", "GOOGLE"],
  EG: ["YOUTUBE", "FACEBOOK", "TIKTOK", "INSTAGRAM", "SNAPCHAT", "LINKEDIN", "TWITTER", "GOOGLE"],
};

export const OBJECTIVE_LABEL: Record<AdObjective, string> = {
  LEADS: "عملاء محتملون",
  SALES: "مبيعات",
  TRAFFIC: "زيارات",
  ENGAGEMENT: "تفاعل",
  AWARENESS: "وعي",
};

export const STATUS_LABEL: Record<AdCampaignStatus, string> = {
  DRAFT: "مسوّدة",
  ACTIVE: "شغّالة",
  PAUSED: "موقوفة",
  ENDED: "منتهية",
};

/** نبرة الحالة — نفس أعراف اللون في بقيّة الأدمن: أخضر يعمل، كهرمانيّ واقف، رماديّ انتهى. */
export const STATUS_TONE: Record<AdCampaignStatus, string> = {
  DRAFT: "text-muted-foreground",
  ACTIVE: "text-emerald-700 dark:text-emerald-400",
  PAUSED: "text-amber-700 dark:text-amber-400",
  ENDED: "text-slate-600 dark:text-slate-400",
};

export const STATUS_DOT: Record<AdCampaignStatus, string> = {
  DRAFT: "bg-muted-foreground",
  ACTIVE: "bg-emerald-500",
  PAUSED: "bg-amber-500",
  ENDED: "bg-slate-400",
};

export interface MarketMeta {
  code: string;
  label: string;
  currency: string;
  currencyName: string;
}

/**
 * السوقان وعملتاهما.
 *
 * والضريبة خارج هذه المرحلة بقرار خالد (٥ سبتمبر): المبلغ المسجَّل هو المكتوب كما هو. المقاسُ
 * حينها — ميتا تضيفها بسعر البلد إن لم يكن الرقم الضريبيّ على الحساب — محفوظٌ في
 * `documents/idea/CAMPAIGNS.html` إن رجعنا إليها.
 */
export const MARKETS: MarketMeta[] = [
  { code: "SA", label: "السعودية", currency: "SAR", currencyName: "بالريال السعودي" },
  { code: "EG", label: "مصر", currency: "EGP", currencyName: "بالجنيه المصري" },
];

export const marketOf = (code: string): MarketMeta =>
  MARKETS.find((m) => m.code === code) ?? MARKETS[0];

/**
 * عدد أيام الحملة — شاملاً طرفيها.
 *
 * حملةٌ من الأوّل إلى الأوّل يومٌ واحد لا صفر، ولذلك `+ 1`: القسمة على صفرٍ تُخرج `Infinity`
 * وتصعد إلى الشاشة رقماً بلا معنى.
 */
export function campaignDays(startAt: Date, endAt: Date): number {
  const n = Math.round((endAt.getTime() - startAt.getTime()) / 86_400_000) + 1;
  return n > 0 ? n : 1;
}

/**
 * الإجماليّ **مشتقٌّ** لا مخزَّن (خالد ٥ سبتمبر) — والمخزَّن `dailyBudget` وحده.
 *
 * تخزينه يخلق رقماً ثانياً يكذب عند أوّل تمديد: مدُّ الحملة أسبوعاً يُبقي الإجماليَّ على حاله
 * ويخفض اليوميَّ سرّاً إلى رقمٍ لم يضبطه أحد في أيّ منصّة، ثم يُبنى عليه تقرير.
 */
export const totalBudget = (dailyBudget: number, startAt: Date, endAt: Date): number =>
  dailyBudget * campaignDays(startAt, endAt);

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

/**
 * وسمٌ يُقترح من السوق والقناة والاسم — ويبقى قابلاً للتعديل قبل الحفظ.
 *
 * لاتينيّ صغير بشرطات: العربيّ في `utm_campaign` يصل مرمَّزاً بالنسبة المئوية فيصير غير
 * مقروءٍ في أي تقرير، والفراغات تُكسر الرابط.
 *
 * ── ولماذا الشهر جزءٌ منه ──────────────────────────────────────────────────────────────
 * أسماء حملاتنا عربية، والتنقية تمحو العربيّ كلّه — فكان الناتج `sa-snapchat` لكلّ حملةٍ
 * سعودية على سناب مهما اختلف اسمها (مقيس حيّاً على «تقويم الأسنان — سبتمبر»). والوسم **فريدٌ
 * في القاعدة**، فثاني حملةٍ منها كانت سترفض الحفظ برسالة تعارض.
 *
 * فالشهر والسنة يدخلان في الوسم: `sa-snapchat-2609` — وهو ما يقوله مشتري الإعلانات أصلاً حين
 * يسمّي حملةً («سناب سبتمبر»). وتبقى الفرادة تحرس الحالة الباقية: حملتان على نفس القناة في
 * نفس الشهر — وهناك يُطلب منه تمييزٌ صريح، وهو مطلبٌ صحيح لا عائق.
 */
export function suggestUtm(
  countryCode: string,
  channel: AdChannel,
  name: string,
  startAt?: Date,
): string {
  const latin = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const d = startAt && !Number.isNaN(startAt.getTime()) ? startAt : new Date();
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}`;

  return [countryCode.toLowerCase(), CHANNEL_UTM[channel], latin, stamp].filter(Boolean).join("-");
}
