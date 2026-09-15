import type { MetadataRoute } from "next";

/**
 * `robots.txt` لنطاق الدفع.
 *
 * لماذا وُجد (مراجعة ١٤ سبتمبر ٢٠٢٦): كان `/robots.txt` يرجع **٤٠٤**، والحجب كلّه
 * معلَّقٌ على وسم `robots: noindex` في `metadata` — وهو لا يعمل إلا بعد أن **يفتح**
 * الزاحف الصفحة. فصفحات الطلب والنتيجة (`/checkout/success?order=…`) كانت تُزار
 * وتُقرأ قبل أن يُقال له لا تفهرس، وفيها رقم طلبٍ ومبلغ.
 *
 * ── لماذا استثناءُ بوتات المعاينة (خالد ١٥ سبتمبر ٢٠٢٦: «عندي حملة إعلانية») ──
 *
 * `Disallow: /` وحده كان يكسر الإعلان نفسه. بوت معاينة الروابط في ميتا وتويتر
 * ولينكدإن **يحترم `robots.txt`**، فبطاقة الإعلان تُرسم بلا صورة ولا عنوان — رابطٌ
 * عارٍ يخفض نسبة النقر ويعرّض الإعلان للرفض في المراجعة.
 *
 * وجوجل أدز خارج المسألة: `AdsBot-Google` **يتجاهل `*`** عمداً
 * (developers.google.com/search/docs/crawling-indexing/google-special-case-crawlers —
 * «The global user agent (`*`) is ignored»)، فحجبُ `*` لم يكن يمسّه أصلاً، ويُسمَّى
 * هنا صراحةً كي لا يعتمد الأمر على سلوكٍ ضمنيّ.
 *
 * والمسموح **صفحتا التسويق فقط**: `/` و`/[market]/plans`. ومسار الشراء كلّه
 * (`checkout` · `contract`) يبقى محجوباً عن الجميع — هناك أرقام طلباتٍ ومبالغ.
 *
 * ولا يعني هذا فهرسة: `robots: { index: false }` باقٍ على كل صفحة، فتُقرأ للمعاينة
 * ولا تدخل نتائج البحث. الزحف والفهرسة قراران منفصلان، وهذا يفتح الأوّل وحده.
 * (`PAY-F5` يفتح الفهرسة بعد أوّل عملية حقيقية.)
 */

/** صفحات التسويق — الوحيدة التي يجوز لبوتٍ أن يفتحها. */
const MARKETING_ALLOW = ["/$", "/sa/plans", "/eg/plans", "/plans", "/logos/", "/icon.svg"];

/** ما لا يُفتح لأحد: أرقام الطلبات والمبالغ والعقد. */
const PRIVATE_DISALLOW = ["/sa/checkout", "/eg/checkout", "/sa/contract", "/eg/contract", "/api/"];

/**
 * بوتات المعاينة التي تحترم `robots.txt` — وهي بالضبط التي تُبنى بها بطاقة الإعلان.
 * `facebookexternalhit` تخدم فيسبوك وإنستغرام وواتساب معاً.
 */
const PREVIEW_BOTS = [
  "facebookexternalhit",
  "Twitterbot",
  "LinkedInBot",
  "Slackbot-LinkExpanding",
  "TelegramBot",
  "WhatsApp",
  "AdsBot-Google",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // الأصل: لا شيء في هذا النطاق مفتوحٌ لزاحفٍ عامّ.
      { userAgent: "*", disallow: "/" },
      // واستثناءٌ ضيّق لبناء بطاقة المعاينة، بلا مسار شراء.
      ...PREVIEW_BOTS.map((userAgent) => ({
        userAgent,
        allow: MARKETING_ALLOW,
        disallow: PRIVATE_DISALLOW,
      })),
    ],
  };
}
