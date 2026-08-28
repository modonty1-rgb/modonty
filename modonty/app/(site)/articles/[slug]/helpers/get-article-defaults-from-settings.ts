import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";

/**
 * كل حقل اختياري إلا `ogType` — لأنه وحده ليس إعداداً (انظر التعليق عند بنائه).
 *
 * كانت كلها إلزامية بقيم احتياطية مكتوبة هنا، فعمودٌ فارغ في `Settings` كان يُنشَر بقيمة
 * الكود ولا يُكتشف أبداً. الغياب الآن يبقى غياباً، والمستهلك يحذف الوسم بدل أن يخترع قيمة.
 */
export type ArticleDefaultsFromSettings = {
  inLanguage?: string;
  metaRobots?: string;
  ogType: string;
  ogLocale?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  sitemapPriority?: number;
  sitemapChangeFreq?: string;
  license?: string;
  isAccessibleForFree?: boolean;
  alternateLanguages: unknown;
  contentFormat?: string;
  siteName?: string;
};

/** يُدرَج المفتاح فقط حين يحمل العمود قيمة — لا مفاتيح فارغة ولا قيماً مخترَعة. */
const put = <T,>(key: string, value: T | null | undefined) =>
  value === null || value === undefined || (typeof value === "string" && value.trim() === "")
    ? {}
    : { [key]: typeof value === "string" ? value.trim() : value };

// Article defaults from Settings (SOT). Used when Article no longer stores the 12 fields.
// Matches admin getArticleDefaultsFromSettings shape.
export async function getArticleDefaultsFromSettings(): Promise<ArticleDefaultsFromSettings> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");
  const settings = await db.settings.findUnique({ where: SETTINGS_SINGLETON_WHERE });
  // لا صفّ إعدادات = لا بيانات، لا نسخةٌ ثانية من القيم مكتوبةٌ هنا. الصفحة تُبنى بما
  // عندها، والوسوم الغائبة تدلّ على الخلل بدل أن تخفيه.
  if (!settings) return { ogType: "article", alternateLanguages: undefined };

  return {
    ...put("inLanguage", settings.inLanguage),
    ...put("metaRobots", settings.defaultMetaRobots),
    // Fixed, never read from Settings. `Settings.defaultOgType` is the LISTING pages' type
    // ("website", and that is what the seed writes), so reading it here published
    // `og:type="website"` on every article the moment the defaults button was pressed.
    // og:type is a property of the object, not a site preference: ogp.me types an article as
    // `article`. Nothing to edit in the admin, so nothing to read from the DB.
    ogType: "article",
    ...put("ogLocale", settings.defaultOgLocale),
    ...put("twitterCard", settings.defaultTwitterCard),
    ...put("twitterSite", settings.twitterSite),
    ...put("twitterCreator", settings.twitterCreator),
    // العمود الخاصّ بالمقالات أوّلاً ثم العامّ — تدرّجٌ بين عمودين في القاعدة، لا احتياطٌ في الكود.
    ...put("sitemapPriority", settings.articleDefaultSitemapPriority ?? settings.defaultSitemapPriority),
    ...put("sitemapChangeFreq", settings.articleDefaultSitemapChangeFreq ?? settings.defaultSitemapChangeFreq),
    ...put("license", settings.defaultLicense),
    ...put("isAccessibleForFree", settings.defaultIsAccessibleForFree),
    alternateLanguages: settings.defaultAlternateLanguages ?? undefined,
    ...put("contentFormat", settings.defaultContentFormat),
    ...put("siteName", settings.siteName),
  };
}

